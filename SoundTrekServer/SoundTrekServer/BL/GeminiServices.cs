using SoundTrekServer.DAL;
using SoundTrekServer.Models;
using SoundTrekServer.Helpers;
using System.Text;

namespace SoundTrekServer.BL
{
    public class GeminiServices
    {
        private readonly GeminiDAL _geminiDAL;

        public GeminiServices()
        {
            _geminiDAL = new GeminiDAL();
        }

        public async Task<List<LandmarkClassificationResult>> ClassifyLandmarksWithGemini(List<WikipediaLandmark> landmarks, List<Category> categories)
        {
            Console.WriteLine("[GeminiServices] ClassifyLandmarksWithGemini: Starting classification with Gemini..."); //log

            try
            {
                // Step 1: Create classification prompt
                string promptText = BuildClassifyLandmarksPromptText(landmarks, categories);

                // Step 2: Send request to Jemini
                var geminiClassifications = await _geminiDAL.ClassifyLandmarks(promptText);
                Console.WriteLine($"[GeminiServices] Received {geminiClassifications?.Count ?? 0} classification results from Gemini"); //log

                return geminiClassifications ?? new List<LandmarkClassificationResult>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GeminiServices] Error during classification with Gemini: {ex.Message}");
                return new List<LandmarkClassificationResult>();
            }

        }

        private string BuildPromptText(List<WikipediaLandmark> landmarks, List<Category> categories)
        {
            var sb = new StringBuilder();

            sb.AppendLine("You are given a list of landmarks. Each landmark includes:");
            sb.AppendLine("- a title (\"title\")");
            sb.AppendLine("- a short description (\"shortDescription\")");
            sb.AppendLine("- possibly a Wikidata item ID (\"wikibaseItem\")");
            sb.AppendLine("- and possibly a list of Wikipedia-assigned categories (\"categories\").\n");

            sb.AppendLine("Your task is to classify each landmark into one or more relevant categories from the list provided below (\"Categories\").");
            sb.AppendLine("Base your classification solely on the provided information about each landmark.\n");

            sb.AppendLine("Please follow these rules:");
            sb.AppendLine("1. Choose only from the provided list of categories.");
            sb.AppendLine("2. Do not create new or custom categories.");
            sb.AppendLine("3. Each landmark may belong to multiple categories.");
            sb.AppendLine("4. You may use the Wikipedia categories or the Wikidata item ID to improve your classification, if available.");
            sb.AppendLine("5. Your response should be a JSON array. Each object should contain:");
            sb.AppendLine("   - \"pageId\": the ID of the landmark");
            sb.AppendLine("   - \"categories\": an array of selected category names (as strings)\n");

            sb.AppendLine("Categories:");
            foreach (var cat in categories)
                sb.AppendLine($"- {cat.CategoryName}");

            sb.AppendLine("\nLandmarks:");
            foreach (var l in landmarks)
            {
                sb.AppendLine("{");
                sb.AppendLine($"  \"pageId\": \"{l.PageId}\",");
                sb.AppendLine($"  \"title\": \"{l.Title}\",");
                sb.AppendLine($"  \"shortDescription\": \"{l.ShortDescription}\",");
                sb.AppendLine($"  \"wikibaseItem\": \"{l.WikibaseItem ?? "null"}\",");
                sb.AppendLine($"  \"categories\": [{string.Join(", ", l.Categories.Select(c => $"\"{c}\""))}]");
                sb.AppendLine("}");
            }

            return sb.ToString();
        }

        private string BuildClassifyLandmarksPromptText(List<WikipediaLandmark> landmarks, List<Category> categories)
        {
            Console.WriteLine("[GeminiServices] BuildClassifyLandmarksPromptText: Building the Prompt Text..."); //log

            var sb = new StringBuilder();
            sb.AppendLine("You are given two lists: a list of landmarks and a list of categories.");
            sb.AppendLine();

            sb.AppendLine("Each landmark includes:");
            sb.AppendLine("- a page ID of the landmark (\"pageId\")");
            sb.AppendLine("- a title (\"title\")");
            sb.AppendLine("- a short description (\"shortDescription\")");
            sb.AppendLine("- possibly a Wikidata item ID (\"wikibaseItem\")");
            sb.AppendLine("- and possibly a list of Wikipedia-assigned categories (\"categories\").");
            sb.AppendLine();

            sb.AppendLine("Each category includes:");
            sb.AppendLine("- an ID of the category (\"categoryId\")");
            sb.AppendLine("- a name of the category (\"categoryName\")");
            sb.AppendLine();

            sb.AppendLine("Your task is to classify each landmark into one or more relevant categories from the provided list of categories (\"Categories\").");
            sb.AppendLine("Base your classification solely on the provided information about each landmark.");
            sb.AppendLine();

            sb.AppendLine("Follow these strict rules:");
            sb.AppendLine("1. Choose only from the provided list of categories. Do not create new or custom categories.");
            sb.AppendLine("2. Each landmark may belong to multiple categories.");
            sb.AppendLine("3. For each landmark, evaluate all provided categories and assign every category that applies (do not omit a relevant category).");
            sb.AppendLine("4. Apply the same decision criteria consistently across all landmarks.");
            sb.AppendLine("5. If some fields are missing, classify using the remaining information without guessing beyond what is supported by the data.");
            sb.AppendLine("6. Return an entry for every input landmark. If no categories are applicable, classify it under the category with the name \"Other landmark\" (use its categoryId from the provided list).");
            sb.AppendLine("7. Your output must be a valid JSON array only. Each object must contain:");
            sb.AppendLine("   - \"pageId\": the ID of the landmark");
            sb.AppendLine("   - \"categories\": an array of IDs of the selected categories (as integers, not strings)");
            sb.AppendLine();

            sb.AppendLine("Categories:");
            foreach (var cat in categories)
            {
                sb.AppendLine("{");
                sb.AppendLine($"  \"categoryId\": {cat.CategoryId},");
                sb.AppendLine($"  \"categoryName\": \"{cat.CategoryName}\"");
                sb.AppendLine("}");
            }
            sb.AppendLine();

            sb.AppendLine("Landmarks:");
            foreach (var l in landmarks)
            {
                sb.AppendLine("{");
                sb.AppendLine($"  \"pageId\": \"{l.PageId}\",");
                sb.AppendLine($"  \"title\": \"{l.Title}\",");
                sb.AppendLine($"  \"shortDescription\": \"{l.ShortDescription}\",");
                sb.AppendLine($"  \"wikibaseItem\": {(l.WikibaseItem != null ? $"\"{l.WikibaseItem}\"" : "null")},");
                sb.AppendLine($"  \"categories\": [{string.Join(", ", l.Categories.Select(c => $"\"{c}\""))}]");
                sb.AppendLine("}");
            }
            sb.AppendLine();

            sb.AppendLine("Expected Output JSON Format example:");
            sb.AppendLine("[");
            sb.AppendLine("  {");
            sb.AppendLine($"    \"pageId\": \"13828\",");
            sb.AppendLine($"    \"categories\": [57, 100, 149, 150, 159, 162, 242]");
            sb.AppendLine("},");
            sb.AppendLine("{");
            sb.AppendLine($"    \"pageId\": \"299994\",");
            sb.AppendLine($"    \"categories\": [24, 57, 100, 149, 159, 162, 242]");
            sb.AppendLine("  }");
            sb.AppendLine("]");

            return sb.ToString();
        }


        public async Task<RecommendationsResponse> CreateUserRecommendationsWithGemini(
            double userLat,
            double userLon,
            List<Landmark> nearbyLandmarks,
            List<Landmark> userLikedLandmarks,
            List<Interest> userInterests
        )
        {
            Console.WriteLine("[GeminiServices] CreateUserRecommendationsWithGemini"); //log

            try
            {
                // Step 1: Use ValidationUtils to clean/validate data
                // Validate nearby landmarks list (removes invalid PageId, Title, coordinates, etc.)
                var validatedNearbyLandmarks = ValidationUtils.ValidateLandmarks(nearbyLandmarks);
                Console.WriteLine($"[GeminiServices] nearbyLandmarks count: {nearbyLandmarks.Count} -> validatedNearbyLandmarks count: {validatedNearbyLandmarks.Count}"); //log
                if (!validatedNearbyLandmarks.Any())
                {
                    Console.WriteLine("[GeminiServices] No valid nearby landmarks after validation – returning empty response.");
                    return new RecommendationsResponse();
                }

                // Validate user liked landmarks list (removes invalid PageId, Title, coordinates, etc.)
                var validatedUserLikedLandmarks = ValidationUtils.ValidateLandmarks(userLikedLandmarks);
                Console.WriteLine($"[GeminiServices] userLikedLandmarks count: {userLikedLandmarks.Count} -> validatedUserLikedLandmarks count: {validatedUserLikedLandmarks.Count}"); //log
                
                // Validate user interests list (removes invalid InterestId, InterestName)
                var validatedUserInterests = ValidationUtils.ValidateInterests(userInterests);
                Console.WriteLine($"[GeminiServices] userInterests count: {userInterests.Count} -> validatedUserInterests count: {validatedUserInterests.Count}");

                // Step 2: Create user recommendations prompt
                string promptText = BuildUserRecommendationsPromptText(
                    userLat,
                    userLon,
                    validatedNearbyLandmarks,
                    validatedUserLikedLandmarks,
                    validatedUserInterests
                );
                Console.WriteLine($"[GeminiServices] Prompt: {promptText.Substring(0, Math.Min(promptText.Length, 100))}..."); // log

                // Step 3: Send request to Jemini to get RecommendationsResult
                RecommendationsResult geminiResult = await _geminiDAL.CreateUserRecommendations(promptText);
                Console.WriteLine($"[GeminiServices] Received RecommendationsResult from Gemini: {geminiResult}"); //log

                // Step 4: Validate and map landmarks
                // Map RecommendedLandmark (from Gemini) -> Landmark (full object) using nearbyLandmarks
                var validatedRecommendedLandmarks = new List<Landmark>();

                foreach (var rec in geminiResult.RecommendedLandmarks)
                {
                    var match = validatedNearbyLandmarks.FirstOrDefault(l => l.PageId == rec.PageId);

                    if (match != null)
                    {
                        validatedRecommendedLandmarks.Add(match);
                    }
                    else
                    {
                        // Log in case Gemini returned a PageId that was not in the list
                        Console.WriteLine($"[GeminiServices] Skipping unknown PageId from Gemini response: {rec.PageId}"); // log
                    }
                }

                // Step 5: Validate route
                // Filter route to include only stops that exist in validatedRecommendedLandmarks
                var validRecommendedPageIds = new HashSet<string>(validatedRecommendedLandmarks.Select(l => l.PageId));

                var validatedRoute = geminiResult.RecommendedRoute
                    .Where(stop => validRecommendedPageIds.Contains(stop.PageId))
                    .ToList();

                Console.WriteLine($"[GeminiServices] Route validated: {validatedRoute.Count} stops remain after filtering invalid PageIds."); // log

                // Step 6: Build final RecommendationsResponse
                var response = new RecommendationsResponse
                {
                    RecommendedLandmarks = validatedRecommendedLandmarks,
                    RecommendedRoute = validatedRoute
                };

                Console.WriteLine($"[GeminiServices] Returning {response.RecommendedLandmarks.Count} recommended landmarks and route with {response.RecommendedRoute.Count} stops to client."); // log
                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GeminiServices] Error during creation of recommendations with Gemini: {ex.Message}");
                return new RecommendationsResponse();
            }
        }

        private string BuildUserRecommendationsPromptText(
            double userLat,
            double userLon,
            List<Landmark> nearbyLandmarks,
            List<Landmark> userLikedLandmarks,
            List<Interest> userInterests,
            int maxRecommendedLandmarks = 10,
            int maxRouteLandmarks = 5
        )
        {
            Console.WriteLine("[GeminiServices] BuildUserRecommendationsPromptText: Building the Prompt Text..."); //log

            var sb = new StringBuilder();
            sb.AppendLine("You are an AI system that recommends and optimizes sightseeing routes for a user.");
            sb.AppendLine("Your task is to analyze the user's profile (interests and liked landmarks) and the list of nearby landmarks,");
            sb.AppendLine("recommend the most relevant landmarks for that specific user, and create an optimized visiting route.");
            sb.AppendLine("Follow the detailed instructions below and strictly return output in JSON format only.");
            sb.AppendLine();

            // Input description
            sb.AppendLine("Input Data Format Description:");
            sb.AppendLine("You are provided with the following JSON data:");
            sb.AppendLine("1. \"NearbyLandmarks\": Array of landmark objects near the user's location. Each landmark object includes:");
            sb.AppendLine("- \"pageId\": ID of the landmark (string)");
            sb.AppendLine("- \"title\": name of the landmark (string)");
            sb.AppendLine("- \"shortDescription\": information about the landmark (string)");
            sb.AppendLine("- \"lon\": longitude coordinate (float)");
            sb.AppendLine("- \"lat\": latitude coordinate (float)");
            sb.AppendLine("- \"mainCategories\": Array of main categories related to the landmark (array of strings).");
            sb.AppendLine("- \"categories\": Array of categories related to the landmark (array of strings).");
            // sb.AppendLine("- \"intrests\": a list of related intrests (array of strings).");
            sb.AppendLine();

            sb.AppendLine("2. \"UserProfile\": Contains user preferences and previously liked landmarks:");
            sb.AppendLine("- \"userCurrentLocation\": An object with the user's current location:");
            sb.AppendLine("  - \"lat\": the user's current latitude (float)");
            sb.AppendLine("  - \"lon\": the user's current longitude (float)");
            sb.AppendLine("- \"userInterests\": Array of strings representing main topics the user prefers (array of strings).");
            sb.AppendLine("- \"userLikedLandmarks\": Array of landmarks the user previously liked (array of landmarks objects, same structure as NearbyLandmarks).");
            sb.AppendLine();

            // Tasks
            sb.AppendLine("Your Tasks:");
            sb.AppendLine("Task 1: Personalized Landmark Recommendations");
            sb.AppendLine("Goal: Select the most relevant landmarks from the nearby landmarks list for the user.");
            sb.AppendLine("Criteria:");
            sb.AppendLine("1. Only choose landmarks from the provided nearby landmarks list.");
            sb.AppendLine("2. Prioritize landmarks whose categories or mainCategories overlap with userInterests or related to them.");
            sb.AppendLine("3. Boost landmarks similar to userLikedLandmarks.");
            sb.AppendLine("4. If insufficient matches, include popular or generally interesting landmarks.");
            sb.AppendLine("5. Exclude duplicates or irrelevant landmarks.");
            sb.AppendLine("6. Provide a short explanation (\"reason\") for each recommended landmark.");
            sb.AppendLine();

            sb.AppendLine("Task 2: Optimized Route Creation");
            sb.AppendLine($"Goal: From the recommended landmarks, select up to {maxRouteLandmarks} landmarks and arrange them in an optimized visiting order.");
            sb.AppendLine("Criteria:");
            sb.AppendLine("1. Only choose landmarks from the recommended landmarks (from Task 1).");
            sb.AppendLine("2. Minimize travel distance between landmarks (simple proximity-based order is acceptable).");
            sb.AppendLine("3. When building the route, use the user's current location (lat/lon provided in userProfile data) as the starting reference point.");
            sb.AppendLine("   Among the recommended landmarks (from Task 1), prioritize starting the route at a landmark close to the user,");
            sb.AppendLine("   but ensure that all selected landmarks are first chosen for being in the top most recommended to the user.");
            sb.AppendLine("4. Return the visiting order as a numbered sequence (StopNumber).");
            sb.AppendLine();

            sb.AppendLine("Task 3: JSON Output Format");
            sb.AppendLine("Goal: Return results in strict JSON format (no extra commentary).");
            sb.AppendLine("Criteria:");
            sb.AppendLine("1. Your output must be a valid JSON object containing two properties:");
            sb.AppendLine("   - \"recommendedLandmarks\": array of objects, each must contain:");
            sb.AppendLine("      - \"PageId\" (string)");
            sb.AppendLine("      - \"Title\" (string)");
            sb.AppendLine("      - \"RecommendationReason\" (string)");
            sb.AppendLine("   - \"recommendedRoute\": array of objects, each must contain:");
            sb.AppendLine("      - \"StopNumber\" (int)");
            sb.AppendLine("      - \"PageId\" (string)");
            sb.AppendLine("2. recommendedRoute must reference only IDs from recommendedLandmarks.");
            sb.AppendLine("3. The \"pageId\" values must remain strings exactly as provided in the input.");
            sb.AppendLine("4. Note: Input field names are in camelCase, but your output must strictly follow PascalCase field names as described.");
            sb.AppendLine("5. Do not add any text outside the JSON object.");

            sb.AppendLine("Expected Output JSON Format example:");
            sb.AppendLine("{");
            sb.AppendLine("  \"recommendedLandmarks\": [");
            sb.AppendLine("    { \"PageId\": \"13828\", \"Title\": \"Landmark A\", \"RecommendationReason\": \"Matches user's interest in History\" },");
            sb.AppendLine("    { \"PageId\": \"13964\", \"Title\": \"Landmark B\", \"RecommendationReason\": \"Similar to Landmark x from the liked landmarks\" }");
            sb.AppendLine("  ],");
            sb.AppendLine("  \"recommendedRoute\": [");
            sb.AppendLine("    { \"StopNumber\": 1, \"PageId\": \"13964\" },");
            sb.AppendLine("    { \"StopNumber\": 2, \"PageId\": \"13828\" }");
            sb.AppendLine("  ]");
            sb.AppendLine("}");
            sb.AppendLine();

            sb.AppendLine("Important Instructions");
            sb.AppendLine("- Strictly follow the input and output formats.");
            sb.AppendLine("- Do not invent data: use only provided inputs.");
            sb.AppendLine("- Return only the JSON response.");
            sb.AppendLine();

            // Append actual data
            sb.AppendLine("Input Data:");
            sb.AppendLine("NearbyLandmarks:");
            foreach (var l in nearbyLandmarks)
            {
                sb.AppendLine("{");
                sb.AppendLine($"  \"pageId\": {l.PageId},");
                sb.AppendLine($"  \"title\": \"{l.Title}\",");
                sb.AppendLine($"  \"lon\": {l.Lon},");
                sb.AppendLine($"  \"lat\": {l.Lat},");
                sb.AppendLine($"  \"shortDescription\": \"{l.ShortDescription}\",");
                sb.AppendLine($"  \"mainCategories\": [{string.Join(", ", (l.MainCategories ?? Enumerable.Empty<MainCategory>()).Select(mc => $"\"{mc.MainCategoryName}\""))}]");
                sb.AppendLine($"  \"categories\": [{string.Join(", ", (l.Categories ?? Enumerable.Empty<Category>()).Select(c => $"\"{c.CategoryName}\""))}]");
                sb.AppendLine("}");
            }
            sb.AppendLine();

            // Add user profile
            sb.AppendLine("UserProfile:");
            sb.AppendLine("{");
            sb.AppendLine($"  \"userCurrentLocation\": {{ \"lat\": {userLat}, \"lon\": {userLon} }},");
            sb.AppendLine($"  \"userInterests\": [{string.Join(", ", (userInterests ?? new List<Interest>()).Select(i => $"\"{i.InterestName}\""))}],");
            sb.AppendLine("  \"userLikedLandmarks\": [");
            foreach (var liked in userLikedLandmarks)
            {
                sb.AppendLine("    {");
                sb.AppendLine($"      \"pageId\": {liked.PageId},");
                sb.AppendLine($"      \"title\": \"{liked.Title}\",");
                sb.AppendLine($"      \"lon\": {liked.Lon},");
                sb.AppendLine($"      \"lat\": {liked.Lat},");
                sb.AppendLine($"      \"shortDescription\": \"{liked.ShortDescription}\",");
                sb.AppendLine($"      \"mainCategories\": [{string.Join(", ", (liked.MainCategories ?? Enumerable.Empty<MainCategory>()).Select(mc => $"\"{mc.MainCategoryName}\""))}]");
                sb.AppendLine($"      \"categories\": [{string.Join(", ", (liked.Categories ?? Enumerable.Empty<Category>()).Select(c => $"\"{c.CategoryName}\""))}]");
                sb.AppendLine("    }");
            }
            sb.AppendLine("  ]");
            sb.AppendLine("}");

            return sb.ToString();
        }

    }
}