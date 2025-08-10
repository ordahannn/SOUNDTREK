using SoundTrekServer.DAL;
using SoundTrekServer.Models;
using SoundTrekServer.Helpers;
using System.Diagnostics;

namespace SoundTrekServer.BL
{
    public class LandmarkService
    {
        private readonly WikipediaLandmarkDAL _wikipediaDAL;
        private readonly CategoriesServices _categoriesServices;
        private readonly GeminiServices _geminiServices;


        public LandmarkService()
        {
            _wikipediaDAL = new WikipediaLandmarkDAL();
            _categoriesServices = new CategoriesServices();
            _geminiServices = new GeminiServices();
        }


        /// <summary>
        /// Retrieves a list of nearby landmarks based on user's location.
        /// Each landmark includes title, image, coords and short description.
        /// </summary>
        /// <param name="lat">Latitude</param>
        /// <param name="lon">Longitude</param>
        /// <param name="radius">Search radius in meters (default = 5000)</param>
        /// <returns>List of Landmark objects</returns>
        public async Task<List<Landmark>> GetNearbyLandmarks(double lat, double lon, int radius = 5000)
        {
            Console.WriteLine("[LandmarkService] GetNearbyLandmarks!"); // log

            var landmarks = new List<Landmark>();
            var wikipediaLandmarks = new List<WikipediaLandmark>();

            var stopwatch = Stopwatch.StartNew(); // Start Stopwatch

            try
            {
                // --------------- Step 1: Fetch nearby landmarks from Wikipedia API ---------------
                var step1 = Stopwatch.StartNew();
                wikipediaLandmarks = await _wikipediaDAL.GetNearbyWikipediaLandmarks(lat, lon, radius);
                step1.Stop();
                Console.WriteLine($"[LandmarkService] Step 1: Retrieved {wikipediaLandmarks.Count} landmarks from Wikipedia API in {step1.ElapsedMilliseconds} ms"); //log

                // Validate Wikipedia nearby landmarks list (removes invalid PageId, Title, coordinates, etc.)
                var validatedWikipediaLandmarks = ValidationUtils.ValidateWikipediaLandmarks(wikipediaLandmarks);
                Console.WriteLine($"[LandmarkService] Validated Wikipedia Landmarks count: {validatedWikipediaLandmarks.Count}"); //log
                if (!validatedWikipediaLandmarks.Any())
                {
                    Console.WriteLine("[LandmarkService] No valid Wikipedia landmarks after validation – returning empty response.");
                    return landmarks;
                }

                // --------------- steps 2: Get categories & mappings from cache ---------------
                var step2 = Stopwatch.StartNew();
                var categories = _categoriesServices.GetCachedCategories();
                var categoryMappings = _categoriesServices.GetCachedCategoryMappings();
                step2.Stop();
                Console.WriteLine($"[LandmarkService] Step 2: Loaded {categories.Count} categories and {categoryMappings.Count} mappings from cache in {step2.ElapsedMilliseconds} ms");

                // Step 2.1: Build a mapping Dictionary for fast lookup: categoryId -> category object 
                var categoryMapById = categories.ToDictionary(c => c.CategoryId, c => c);

                // Step 2.2: Build a mapping Dictionary for fast lookup: CategoryMappings object -> categoryId
                var categoryToMappings = categoryMappings.ToDictionary(m => m.CategoryId);

                // Step 2.3: Build a set of valid category IDs
                var validCategoryIds = new HashSet<int>(categoryMapById.Keys);

                // --------------- steps 3: classify landmarks with Gemini ---------------
                var step3 = Stopwatch.StartNew();
                var classificationResults = await _geminiServices.ClassifyLandmarksWithGemini(
                    validatedWikipediaLandmarks,
                    categories
                );

                // Step 3.1: Filter Gemini results — only keep categories that exist in the DB
                foreach (var result in classificationResults)
                {
                    result.Categories = result.Categories
                        .Where(categoryId => validCategoryIds.Contains(categoryId))
                        .ToList();
                }

                step3.Stop();
                Console.WriteLine($"[LandmarkService] Step 3: Classified landmarks with Gemini in {step3.ElapsedMilliseconds} ms");

                // --------------- steps 4: build list of Landmark objects ---------------
                Console.WriteLine("[LandmarkService.GetNearbyLandmarks] create the list of Landmark objects..."); //log
                var step4 = Stopwatch.StartNew();

                // Step 4.1: Map classification results to Landmark objects
                // Build a mapping Dictionary (of the results): pageId -> list of category IDs
                var pageIdToCategoriesMap = classificationResults
                    .ToDictionary(r => r.PageId, r => r.Categories);

                // Step 4.2: Build the Landmarks list from the WikipediaLandmarks and classification results
                landmarks = validatedWikipediaLandmarks.Select(l =>
                {
                    // Build the landmark's Categories list
                    // Find the landmark's list of category IDs (if it exists) and create a Category objects list
                    var assignedCategories = pageIdToCategoriesMap.TryGetValue(l.PageId, out var categoryIds)
                        ? categoryIds.Select(id => categoryMapById[id]).ToList()
                        : new List<Category>();

                    // Build the landmark's list of MainCategories and Interests
                    var mainCategories = new List<MainCategory>();
                    var interests = new List<Interest>();
                    foreach (var cat in assignedCategories)
                    {
                        if (categoryToMappings.TryGetValue(cat.CategoryId, out var mapping))
                        {
                            mainCategories.AddRange(mapping.MainCategories);
                            interests.AddRange(mapping.Interests);
                        }
                    }
                    // Remove duplicates by ID
                    mainCategories = mainCategories.DistinctBy(mc => mc.MainCategoryId).ToList();
                    interests = interests.DistinctBy(i => i.InterestId).ToList();

                    return new Landmark
                    {
                        PageId = l.PageId,
                        Title = l.Title,
                        Lat = l.Lat,
                        Lon = l.Lon,
                        ImageUrl = l.ImageUrl,
                        ShortDescription = l.ShortDescription,
                        MainCategories = mainCategories,
                        Categories = assignedCategories,
                        Interests = interests
                    };
                }).ToList();

                step4.Stop();
                Console.WriteLine($"[LandmarkService] Step 4: Built Landmark objects in {step4.ElapsedMilliseconds} ms");

                // --------------- TODO: add step 5 logic ---------------
                // steps 5: update DB - update 'LandmarkCategories' table with the classifications
                // ------------------------------------------------------------

                stopwatch.Stop();
                Console.WriteLine($"[LandmarkService] GetNearbyLandmarks TOTAL execution time: {stopwatch.ElapsedMilliseconds} ms");

                return landmarks;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                Console.WriteLine($"[LandmarkService] Error in GetNearbyLandmarks after {stopwatch.ElapsedMilliseconds} ms: {ex.Message}");

                return landmarks;
            }
        }
        

        /// <summary>
        /// Retrieves the full Wikipedia article text using pageId.
        /// </summary>
        /// <param name="pageId">Wikipedia Page ID</param>
        /// <returns>Full article text as plain string</returns>
        public async Task<(string? Title, string Description)> GetFullDescriptionByPageIdAsync(string pageId)
        {
            // Step 1: Retrieve the raw description from Wikipedia using DAL
            var (title, rawText) = await _wikipediaDAL.GetFullDescriptionByPageIdAsync(pageId);

            // Step 2: Clean the text (remove tabs, newlines, 'References' section, etc.)
            var cleanedText = string.IsNullOrWhiteSpace(rawText) ? string.Empty : CleanText(rawText);

            // Step 3: Return the cleaned result
            return (title, cleanedText);
        }

        /// <summary>
        /// Cleans a raw Wikipedia extract text:
        /// - Removes newlines, carriage returns, and tabs
        /// - Trims extra spaces
        /// - Optional: Removes "== References ==" or "== See also ==" sections and anything after them
        /// </summary>
        public static string CleanText(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText))
                return string.Empty;

            // Remove line breaks, carriage returns, and tabs
            string cleaned = rawText.Replace("\n", " ")
                                .Replace("\r", " ")
                                .Replace("\t", " ")
                                .Trim();

            // Optional: Remove everything after "== References ==" or "== See also =="
            var cutMarkers = new[] { "== References ==", "== See also ==" };

            foreach (var marker in cutMarkers)
            {
                int index = cleaned.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                if (index >= 0)
                {
                    cleaned = cleaned.Substring(0, index).Trim();
                }
            }
            return cleaned;
        }

    }
}
