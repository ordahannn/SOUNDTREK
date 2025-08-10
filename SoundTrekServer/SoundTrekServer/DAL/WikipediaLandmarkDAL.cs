using System.Net.Http;
using System.Text.Json;
using SoundTrekServer.Models;
using SoundTrekServer.Helpers;
using System.Diagnostics;
using System.Text;

namespace SoundTrekServer.DAL
{
    public class WikipediaLandmarkDAL
    {
        private readonly HttpClient _httpClient = new HttpClient();
        
        // Base URL for Wikipedia API queries
        private const string WikipediaApiBaseUrl = "https://en.wikipedia.org/w/api.php";

        /// <summary>
        /// Retrieves a list of nearby Wikipedia landmarks based on user's location.
        /// Each landmark includes pageId, title, coords, image, short description, image url, categories, and wikibaseItem.
        /// Only landmarks with valid pageId and summary are included.
        /// </summary>
        /// <param name="lat">Latitude</param>
        /// <param name="lon">Longitude</param>
        /// <param name="radius">Search radius in meters (default = 1000)</param>
        /// <returns>List of WikipediaLandmark objects</returns>
        public async Task<List<WikipediaLandmark>> GetNearbyWikipediaLandmarks(double lat, double lon, int radius)
        {
            Console.WriteLine("[WikipediaLandmarkDAL] GetNearbyWikipediaLandmarks!"); // log

            var stopwatch = Stopwatch.StartNew(); // Start timer

            var landmarks = new List<WikipediaLandmark>();
            var wikibaseIdsForCoords = new List<string>(); // NEW
            var pageIdsForCoords = new List<string>(); // NEW

            string? continueParams = null;     // NEW
            string? lastContinueParams = null; // NEW - to compare if the value has been repeated

            // Number of results we request per API call (page size).
            const int geoSearchPageSize = 50;

            int iteration = 0;              // NEW – Count iterations
            const int maxIterations = 10;   // NEW – safety guard to avoid infinite loops
            int totalPagesCount = 0;        // NEW – Count total pages from all iterations

            try
            {
                // ---- Step one: Get the basic information about all pages ----
                do
                {
                    iteration++; // NEW
                    if (iteration > maxIterations) // NEW
                    {
                        Console.WriteLine("[WikipediaLandmarkDAL] Max iterations reached – breaking loop to avoid infinite loop."); // NEW
                        break; // NEW
                    }
                    Console.WriteLine($"[WikipediaLandmarkDAL] Iteration #{iteration} - Current continueParams: {continueParams ?? "NONE"}");

                    // Wikipedia API request that:
                    // - Uses generator=geosearch to find nearby pages
                    // - Requests props: extracts (summary), pageimages (thumbnail),
                    //                   categories (for classification), coordinates (lat/lon),
                    //                   pageprops (for wikibase_item from Wikidata)
                    var url = $"{WikipediaApiBaseUrl}" +
                            $"?action=query" +
                            $"&generator=geosearch" +
                            $"&ggscoord={lat}|{lon}" +
                            $"&ggsradius={radius}" +
                            $"&ggslimit={geoSearchPageSize}" +
                            $"&prop=extracts|pageimages|categories|coordinates|pageprops" + // 
                            $"&exintro=true" +
                            $"&explaintext=true" +
                            $"&piprop=thumbnail" +
                            $"&pithumbsize=200" +
                            $"&format=json";

                    // Add continue parameters from the previous request to the request URL (if exists)
                    if (!string.IsNullOrEmpty(continueParams)) // NEW
                    {
                        url += continueParams; // NEW
                        Console.WriteLine($"[WikipediaLandmarkDAL] Adding continue params to URL: {continueParams}"); // NEW
                    }

                    // Send the HTTP GET request
                    var response = await _httpClient.GetStringAsync(url);
                    // Parse the JSON response
                    var json = JsonDocument.Parse(response);

                    // Count the number of pages returned this iteration
                    int currentIterationPagesCount = 0; // NEW

                    // Extract pages array if available
                    if (json.RootElement.TryGetProperty("query", out var query) &&
                        query.TryGetProperty("pages", out var pages))
                    {
                        // Loop through all returned pages
                        foreach (var page in pages.EnumerateObject())
                        {
                            var pageObj = page.Value;

                            // Extract required fields from Wikipedia response
                            string pageId = pageObj.GetProperty("pageid").ToString();
                            string title = pageObj.GetProperty("title").GetString() ?? "";

                            // Extract the Latitude and Longitude (from 'coordinates' array)
                            double latVal = 0, lonVal = 0;
                            if (iteration == 1)
                            {
                                if (pageObj.TryGetProperty("coordinates", out var coordArr) &&
                                    coordArr.ValueKind == JsonValueKind.Array &&
                                    coordArr.GetArrayLength() > 0)
                                {
                                    var coord = coordArr[0];
                                    latVal = coord.GetProperty("lat").GetDouble();
                                    lonVal = coord.GetProperty("lon").GetDouble();
                                }
                            }

                            // Extract the summary - short description (if available)
                            string? shortDescription = null;
                            if (pageObj.TryGetProperty("extract", out var extractElement))
                            {
                                shortDescription = extractElement.GetString();
                            }

                            // Extract the thumbnail image URL (if available)
                            string? imageUrl = null;
                            if (pageObj.TryGetProperty("thumbnail", out var thumbnailElement) &&
                                thumbnailElement.TryGetProperty("source", out var sourceElement))
                            {
                                imageUrl = sourceElement.GetString();
                            }

                            // Extract the categories (if available)
                            List<string> categories = new();
                            if (pageObj.TryGetProperty("categories", out var categoriesArray) &&
                                categoriesArray.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var category in categoriesArray.EnumerateArray())
                                {
                                    if (category.TryGetProperty("title", out var categoryTitle))
                                    {
                                        string raw = categoryTitle.GetString() ?? "";
                                        if (raw.StartsWith("Category:"))
                                            raw = raw.Substring("Category:".Length);
                                        categories.Add(raw);
                                    }
                                }
                            }

                            // Extract Wikidata item ID (e.g., "Q123456") (if available)
                            string? wikibaseItem = pageObj.TryGetProperty("pageprops", out var pp) &&
                                                pp.TryGetProperty("wikibase_item", out var wi)
                                                        ? wi.GetString()
                                                        : null;

                            // Only add landmark if it has valid pageId, title and a summary
                            if (!string.IsNullOrWhiteSpace(pageId)              // Ensure PageId is provided
                                && !string.IsNullOrWhiteSpace(title)            // Ensure Title is provided
                                && !string.IsNullOrWhiteSpace(shortDescription) // Ensure short description is provided
                            )
                            {
                                landmarks.Add(new WikipediaLandmark
                                {
                                    PageId = pageId,
                                    Title = title,
                                    Lat = latVal,
                                    Lon = lonVal,
                                    ShortDescription = shortDescription,
                                    ImageUrl = imageUrl,
                                    Categories = categories,
                                    WikibaseItem = wikibaseItem
                                });
                                Console.WriteLine($"Landmark added to landmarks list -> pageId: {pageId}, lat: {latVal}, lon: {lonVal}"); // log

                                if (latVal == 0 && lonVal == 0)
                                {
                                    Console.WriteLine($"Landmark added to pageIdsForCoords list - pageId: {pageId}"); // log
                                    pageIdsForCoords.Add(pageId); // NEW                                        

                                    // if (!string.IsNullOrWhiteSpace(wikibaseItem))
                                    // {
                                    //     Console.WriteLine($"Landmark added to wikibaseIdsForCoords list - wikibaseItem: {wikibaseItem}"); // log
                                    //     wikibaseIdsForCoords.Add(wikibaseItem); // NEW
                                    // }
                                }

                                currentIterationPagesCount++; // NEW
                                Console.WriteLine($"currentIterationPagesCount++: {currentIterationPagesCount}"); // log
                            }
                        }
                    }
                    totalPagesCount += currentIterationPagesCount;
                    Console.WriteLine($"Iteration #{iteration}: Retrieved {currentIterationPagesCount} pages from API."); // log
                    Console.WriteLine($"Iteration #{iteration}: Total landmarks added so far: {landmarks.Count} (out of {totalPagesCount} pages processed).");


                    // --- Build continueParams from all keys in continue ---
                    if (json.RootElement.TryGetProperty("continue", out var cont)) // NEW
                    {
                        // The keys returned from Wikipedia
                        Console.WriteLine($"[WikipediaLandmarkDAL] Continue keys received: {string.Join(", ", cont.EnumerateObject().Select(p => p.Name + "=" + p.Value))}"); // NEW

                        var sb = new StringBuilder(); // NEW
                        foreach (var prop in cont.EnumerateObject()) // NEW
                        {
                            // Add each key and its value (ggscontinue, cocontinue, clcontinue, continue)
                            sb.Append($"&{prop.Name}={Uri.EscapeDataString(prop.Value.ToString())}"); // NEW
                        }

                        // Compare to previous value to avoid infinite loop
                        string newParams = sb.ToString();
                        if (newParams == lastContinueParams) // NEW
                        {
                            Console.WriteLine("[WikipediaLandmarkDAL] Same continue token detected twice – breaking to avoid infinite loop."); // NEW
                            continueParams = null; // NEW
                        }
                        else
                        {
                            lastContinueParams = newParams; // NEW
                            continueParams = newParams;     // NEW
                        }
                    }
                    else
                    {
                        continueParams = null; // NEW - No more pages
                        Console.WriteLine("[WikipediaLandmarkDAL] No more pages to continue."); // NEW
                    }

                    if (landmarks.Count == geoSearchPageSize || totalPagesCount >= geoSearchPageSize)
                        break;

                } while (!string.IsNullOrEmpty(continueParams));

                // ---- Step two: Get coordinates for all PageIds at once ----
                Console.WriteLine($"[WikipediaLandmarkDAL] pageIdsForCoords count: {pageIdsForCoords.Count}."); // NEW
                if (pageIdsForCoords.Count > 0)
                {
                    var coordinatesMap = await GetCoordinatesByPageIds(pageIdsForCoords);
                    foreach (var lm in landmarks)
                    {
                        if (coordinatesMap.TryGetValue(lm.PageId, out var coord))
                        {
                            lm.Lat = coord.Lat;
                            lm.Lon = coord.Lon;
                        }
                    }
                }

                // // ---- Step two: Get coordinates for all wikibaseIds at once ----
                // Console.WriteLine($"[WikipediaLandmarkDAL] wikibaseIdsForCoords count: {wikibaseIdsForCoords.Count}."); // NEW
                // if (wikibaseIdsForCoords.Count > 0)
                // {
                //     var coordinatesMap = await GetCoordinatesByWikibaseIds(wikibaseIdsForCoords);
                //     foreach (var lm in landmarks)
                //     {
                //         if (!string.IsNullOrEmpty(lm.WikibaseItem) && coordinatesMap.TryGetValue(lm.WikibaseItem, out var coord))
                //         {
                //             lm.Lat = coord.Lat;
                //             lm.Lon = coord.Lon;
                //         }
                //     }
                // }

                stopwatch.Stop(); // Stop timer
                Console.WriteLine($"[WikipediaLandmarkDAL] Wikipedia API call finished. Total landmarks: {landmarks.Count}. Took {stopwatch.ElapsedMilliseconds} ms");

                return landmarks;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                Console.WriteLine($"[WikipediaLandmarkDAL] Error in paginated GetNearbyWikipediaLandmarks (after {stopwatch.ElapsedMilliseconds} ms): {ex.Message}");
                return landmarks;
            }
        }
        

        /// <summary>
        /// Fetches geographic coordinates (latitude, longitude) for a list of Wikipedia page IDs in batches.
        /// Uses the Wikipedia API "prop=coordinates" and processes up to 50 IDs per request.
        /// Includes safety iteration limits and detailed logging for debugging.
        /// </summary>
        /// <param name="pageIds">List of Wikipedia page IDs to retrieve coordinates for.</param>
        /// <returns>
        /// Dictionary mapping pageId (string) to a tuple of (Lat, Lon) as doubles.
        /// </returns>
        private async Task<Dictionary<string, (double Lat, double Lon)>> GetCoordinatesByPageIds(List<string> pageIds)
        {
            Console.WriteLine($"[WikipediaLandmarkDAL] GetCoordinatesByPageIds: Starting. Total PAGE IDs: {pageIds.Count}");

            var stopwatch = Stopwatch.StartNew(); // Start timer            

            var result = new Dictionary<string, (double Lat, double Lon)>();

            // Maximum page IDs per API call
            const int batchSize = 10;
            Console.WriteLine($"[WikipediaLandmarkDAL] Using batchSize={batchSize}"); // log


            // Safety limit to avoid infinite loops (e.g., unexpected input or API error)
            const int maxIterations = 10;
            int iteration = 0;

            // Iterate over pageIds in chunks of batchSize
            for (int i = 0; i < pageIds.Count; i += batchSize)
            {
                iteration++;
                if (iteration > maxIterations)
                {
                    Console.WriteLine($"[WikipediaLandmarkDAL] Max iterations reached ({maxIterations}). Stopping early.");
                    break;
                }

                // Select the current batch of page IDs
                var batch = pageIds.Skip(i).Take(batchSize).ToList();
                string idsParam = string.Join("|", batch);

                Console.WriteLine($"[WikipediaLandmarkDAL] ---- Batch {iteration} / Max {maxIterations} ----"); // log
                Console.WriteLine($"[WikipediaLandmarkDAL] Fetching coordinates by PAGE IDs: {i + 1}–{i + batch.Count + i} out of {pageIds.Count}"); // log

                // Build the Wikipedia API request URL
                string url = $"{WikipediaApiBaseUrl}" +
                            $"?action=query" +
                            $"&prop=coordinates|pageprops" +
                            $"&pageids={idsParam}" +
                            $"&coprop=type|name|dim|country|region|globe" + // Adds additional fields from the coordinates
                            $"&colimit=max" + // Returns all coordinates if there are several
                            $"&format=json";

                try
                {
                    // Make the API request and parse the JSON response
                    var response = await _httpClient.GetStringAsync(url);
                    var json = JsonDocument.Parse(response);

                    // Count the number of pages returned this iteration
                    int currentIterationPagesCount = 0; // NEW
                    int foundCoordsCount = 0; // NEW

                    if (json.RootElement.TryGetProperty("query", out var query) &&
                        query.TryGetProperty("pages", out var pages))
                    {
                        // Loop through each page object in the response
                        foreach (var page in pages.EnumerateObject())
                        {
                            var pageObj = page.Value;
                            string pageId = pageObj.GetProperty("pageid").ToString();

                            // Check if coordinates are available for this page
                            if (pageObj.TryGetProperty("coordinates", out var coordArr) &&
                                coordArr.ValueKind == JsonValueKind.Array &&
                                coordArr.GetArrayLength() > 0)
                            {
                                // Extract latitude and longitude from the coordinates array
                                var coord = coordArr[0];
                                double lat = coord.GetProperty("lat").GetDouble();
                                double lon = coord.GetProperty("lon").GetDouble();

                                // Save result in dictionary
                                result[pageId] = (lat, lon);

                                foundCoordsCount++;
                                Console.WriteLine($"[WikipediaLandmarkDAL] → PageId {pageId}: lat={lat}, lon={lon}");
                            }
                            else
                            {
                                Console.WriteLine($"[WikipediaLandmarkDAL] → PageId {pageId}: No coordinates found");
                            }
                            currentIterationPagesCount++;
                        }
                        Console.WriteLine($"[WikipediaLandmarkDAL] Batch {iteration} complete: Found {foundCoordsCount}/{currentIterationPagesCount} coordinates this batch. Total so far: {result.Count}");
                    }
                    else
                    {
                        Console.WriteLine($"[WikipediaLandmarkDAL] No 'pages' object in response for batch {iteration}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[WikipediaLandmarkDAL] Error fetching batch {iteration}: {ex.Message}");
                }

            }

            stopwatch.Stop(); // Stop timer

            // Final log: total coordinates found
            Console.WriteLine($"[WikipediaLandmarkDAL] Completed. Found coordinates for {result.Count}/{pageIds.Count} pages. Took {stopwatch.ElapsedMilliseconds} ms.");
            return result;
        }



        private async Task<Dictionary<string, (double Lat, double Lon)>> GetCoordinatesByWikibaseIds(List<string> wikibaseIds)
        {
            Console.WriteLine($"[WikipediaLandmarkDAL] GetCoordinatesByWikibaseIds: Starting. Total Wikibase IDs: {wikibaseIds.Count}");

            var stopwatch = Stopwatch.StartNew(); // Start timer            
            var result = new Dictionary<string, (double Lat, double Lon)>();

            // Maximum IDs per API call
            const int batchSize = 20;
            Console.WriteLine($"[WikipediaLandmarkDAL] Using batchSize={batchSize}"); // log

            const int maxIterations = 4; // Safety
            int iteration = 0;

            for (int i = 0; i < wikibaseIds.Count; i += batchSize)
            {
                iteration++;
                if (iteration > maxIterations)
                {
                    Console.WriteLine($"[WikipediaLandmarkDAL] Max iterations reached ({maxIterations}). Stopping early."); // log
                    break;
                }

                // Select current batch of IDs (e.g., Q123|Q456)
                var batch = wikibaseIds.Skip(i).Take(batchSize).ToList();
                string idsParam = string.Join("|", batch);

                Console.WriteLine($"[WikipediaLandmarkDAL] Fetching coordinates for batch {iteration}: Wikibase IDs {i + 1}–{i + batch.Count + i}/{wikibaseIds.Count}"); // log

                // Build the Wikidata API request URL
                string url = $"https://www.wikidata.org/w/api.php" +
                            $"?action=wbgetentities" +
                            $"&ids={idsParam}" +
                            $"&props=claims" +
                            $"&languages=en" +
                            $"&format=json";

                try
                {
                    // Send the request
                    var response = await _httpClient.GetStringAsync(url);
                    var json = JsonDocument.Parse(response);

                    // Wikidata response structure: entities -> Qxxxx -> claims -> P625 -> mainsnak -> datavalue -> value
                    if (json.RootElement.TryGetProperty("entities", out var entities))
                    {
                        foreach (var entity in entities.EnumerateObject())
                        {
                            string wikibaseId = entity.Name;
                            var entityObj = entity.Value;

                            // Navigate to claims -> P625
                            if (entityObj.TryGetProperty("claims", out var claims) &&
                                claims.TryGetProperty("P625", out var coordClaims) &&
                                coordClaims.ValueKind == JsonValueKind.Array &&
                                coordClaims.GetArrayLength() > 0)
                            {
                                var mainsnak = coordClaims[0].GetProperty("mainsnak");
                                if (mainsnak.TryGetProperty("datavalue", out var datavalue) &&
                                    datavalue.TryGetProperty("value", out var valueObj))
                                {
                                    // P625 value structure: { "latitude": xx, "longitude": yy, ... }
                                    double lat = valueObj.GetProperty("latitude").GetDouble();
                                    double lon = valueObj.GetProperty("longitude").GetDouble();

                                    result[wikibaseId] = (lat, lon);

                                    Console.WriteLine($"[WikipediaLandmarkDAL] → Wikibase {wikibaseId}: lat={lat}, lon={lon}"); // log
                                }
                                else
                                {
                                    Console.WriteLine($"[WikipediaLandmarkDAL] → Wikibase {wikibaseId}: No valid datavalue in P625"); // log
                                }
                            }
                            else
                            {
                                Console.WriteLine($"[WikipediaLandmarkDAL] → Wikibase {wikibaseId}: No P625 claim found"); // log
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine($"[WikipediaLandmarkDAL] No 'entities' object in response for batch {iteration}"); // log
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[WikipediaLandmarkDAL] Error fetching batch {iteration} (Wikidata): {ex.Message}");
                }
            }

            stopwatch.Stop();
            Console.WriteLine($"[WikipediaLandmarkDAL] Completed. Found coordinates for {result.Count}/{wikibaseIds.Count} wikibase IDs. Took {stopwatch.ElapsedMilliseconds} ms.");
            return result;
        }




        // /// <summary>
        // /// Retrieves nearby landmarks (full details) using two-phase query:
        // /// 1. GeoSearch to get pageIds (pagination until all results).
        // /// 2. Batch query for details (extracts, images, categories, coordinates, pageprops).
        // /// </summary>
        // public async Task<List<WikipediaLandmark>> GetNearbyWikipediaLandmarks(double lat, double lon, int radius)
        // {
        //     Console.WriteLine("[WikipediaLandmarkDAL] GetNearbyWikipediaLandmarks!");

        //     var stopwatch = Stopwatch.StartNew();
        //     try
        //     {
        //         // STEP 1: Get all pageIds (no filtering yet)
        //         var pageIds = await GetGeoSearchPageIds(lat, lon, radius);

        //         if (pageIds.Count == 0)
        //         {
        //             Console.WriteLine("[WikipediaLandmarkDAL] No geosearch results found.");
        //             return new List<WikipediaLandmark>();
        //         }

        //         // STEP 2: Fetch details in batches of 50 (including coordinates)
        //         var landmarks = await FetchDetailsByPageIds(pageIds);

        //         stopwatch.Stop();
        //         Console.WriteLine($"[WikipediaLandmarkDAL] Total execution time: {stopwatch.ElapsedMilliseconds} ms, returned {landmarks.Count} landmarks.");

        //         return landmarks;
        //     }
        //     catch (Exception ex)
        //     {
        //         stopwatch.Stop();
        //         Console.WriteLine($"[WikipediaLandmarkDAL] Error in GetNearbyWikipediaLandmarks: {ex.Message}");
        //         return new List<WikipediaLandmark>();
        //     }
        // }

        // // ----------------- STEP 1: Get pageIds only -----------------
        // private async Task<List<string>> GetGeoSearchPageIds(double lat, double lon, int radius)
        // {
        //     var results = new List<string>();
        //     string? continueToken = null;
        //     const int geoSearchPageSize = 50; // max allowed

        //     do
        //     {
        //         var url = $"{WikipediaApiBaseUrl}" +
        //                   $"?action=query" +
        //                   $"&generator=geosearch" +
        //                   $"&ggscoord={lat}|{lon}" +
        //                   $"&ggsradius={radius}" +
        //                   $"&ggslimit={geoSearchPageSize}" +
        //                   $"&format=json";

        //         if (!string.IsNullOrEmpty(continueToken))
        //             url += $"&ggscontinue={continueToken}";

        //         var response = await _httpClient.GetStringAsync(url);
        //         var json = JsonDocument.Parse(response);

        //         if (json.RootElement.TryGetProperty("query", out var query) &&
        //             query.TryGetProperty("pages", out var pages))
        //         {
        //             foreach (var page in pages.EnumerateObject())
        //             {
        //                 var pageObj = page.Value;
        //                 string pageId = pageObj.GetProperty("pageid").ToString();
        //                 results.Add(pageId);
        //             }
        //         }

        //         // Get next continue token
        //         if (json.RootElement.TryGetProperty("continue", out var cont) &&
        //             cont.TryGetProperty("ggscontinue", out var nextToken))
        //         {
        //             continueToken = nextToken.GetString();
        //         }
        //         else
        //         {
        //             continueToken = null;
        //         }

        //     } while (!string.IsNullOrEmpty(continueToken));

        //     return results.Distinct().ToList(); // remove duplicates
        // }

        // // ----------------- STEP 2: Fetch full details (with coords) -----------------
        // private async Task<List<WikipediaLandmark>> FetchDetailsByPageIds(List<string> pageIds)
        // {
        //     var landmarks = new List<WikipediaLandmark>();

        //     foreach (var batch in pageIds.Chunk(50)) // 50 pageIds per request
        //     {
        //         string idsParam = string.Join("|", batch);

        //         var url = $"{WikipediaApiBaseUrl}" +
        //                   $"?action=query" +
        //                   $"&pageids={idsParam}" +
        //                   $"&prop=extracts|pageimages|categories|pageprops|coordinates" + // כולל coordinates!
        //                   $"&exintro=true" +
        //                   $"&explaintext=true" +
        //                   $"&piprop=thumbnail" +
        //                   $"&pithumbsize=200" +
        //                   $"&format=json";

        //         var response = await _httpClient.GetStringAsync(url);
        //         var json = JsonDocument.Parse(response);

        //         if (json.RootElement.TryGetProperty("query", out var query) &&
        //             query.TryGetProperty("pages", out var pages))
        //         {
        //             foreach (var page in pages.EnumerateObject())
        //             {
        //                 var pageObj = page.Value;
        //                 string pageId = pageObj.GetProperty("pageid").ToString();
        //                 string title = pageObj.GetProperty("title").GetString() ?? "";

        //                 // Extract coordinates
        //                 double latVal = 0, lonVal = 0;
        //                 if (pageObj.TryGetProperty("coordinates", out var coordArr) &&
        //                     coordArr.ValueKind == JsonValueKind.Array &&
        //                     coordArr.GetArrayLength() > 0)
        //                 {
        //                     var coord = coordArr[0];
        //                     latVal = coord.GetProperty("lat").GetDouble();
        //                     lonVal = coord.GetProperty("lon").GetDouble();
        //                 }

        //                 // Skip if no valid coordinates
        //                 if (!GeoUtils.IsValidCoordinate(latVal, lonVal))
        //                     continue;

        //                 // Extract description
        //                 string? shortDescription = null;
        //                 if (pageObj.TryGetProperty("extract", out var extractElement))
        //                     shortDescription = extractElement.GetString();

        //                 // Extract image
        //                 string? imageUrl = null;
        //                 if (pageObj.TryGetProperty("thumbnail", out var thumbnailElement) &&
        //                     thumbnailElement.TryGetProperty("source", out var sourceElement))
        //                 {
        //                     imageUrl = sourceElement.GetString();
        //                 }

        //                 // Extract categories
        //                 List<string> categories = new();
        //                 if (pageObj.TryGetProperty("categories", out var categoriesArray) &&
        //                     categoriesArray.ValueKind == JsonValueKind.Array)
        //                 {
        //                     foreach (var category in categoriesArray.EnumerateArray())
        //                     {
        //                         if (category.TryGetProperty("title", out var categoryTitle))
        //                         {
        //                             string raw = categoryTitle.GetString() ?? "";
        //                             if (raw.StartsWith("Category:"))
        //                                 raw = raw.Substring("Category:".Length);
        //                             categories.Add(raw);
        //                         }
        //                     }
        //                 }

        //                 // Extract Wikidata item
        //                 string? wikibaseItem = pageObj.TryGetProperty("pageprops", out var pp) &&
        //                                        pp.TryGetProperty("wikibase_item", out var wi)
        //                                         ? wi.GetString()
        //                                         : null;

        //                 // Add landmark
        //                 if (!string.IsNullOrWhiteSpace(shortDescription))
        //                 {
        //                     landmarks.Add(new WikipediaLandmark
        //                     {
        //                         PageId = pageId,
        //                         Title = title,
        //                         Lat = latVal,
        //                         Lon = lonVal,
        //                         ShortDescription = shortDescription,
        //                         ImageUrl = imageUrl,
        //                         Categories = categories,
        //                         WikibaseItem = wikibaseItem
        //                     });
        //                 }
        //             }
        //         }
        //     }

        //     return landmarks;
        // }


        // ----- TODO: check if needed (for TomTom) -----
        /// <summary>
        /// Retrieves both the main image and the short description of a landmark from Wikipedia.
        /// Uses the REST API: https://en.wikipedia.org/api/rest_v1/page/summary/{title}
        /// </summary>
        /// <param name="title">The name of the Landmark (e.g., "Big Ben")</param>
        /// <returns>A tuple containing (WikipediaTitle, WikipediaPageId, ImageUrl, ShortDescription), or nulls if not available</returns>
        public async Task<(string? WikipediaTitle, string? WikipediaPageId, string? ImageUrl, string? ShortDescription)> GetSummaryAsync(string title)
        {
            // Build the Wikipedia summary API endpoint using the landmarks title
            var wikipediaAPI = $"https://en.wikipedia.org/api/rest_v1/page/summary/{Uri.EscapeDataString(title)}";

            try
            {
                // Send the HTTP GET request
                var response = await _httpClient.GetAsync(wikipediaAPI);

                if (!response.IsSuccessStatusCode)
                {
                    // Return nulls if the page was not found or request failed
                    return (null, null, null, null);
                }

                // Parse the JSON response
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                // Extract the title (normalized by Wikipedia)
                string? wikipediaTitle = root.GetProperty("title").GetString();

                // Extract the page ID (useful for precise lookup)
                string? wikipediaPageId = root.TryGetProperty("pageid", out var pageIdElement)
                    ? pageIdElement.GetInt32().ToString()
                    : null;

                // Extract the thumbnail image URL (if available)
                string? imageUrl = null;
                if (root.TryGetProperty("thumbnail", out var thumbnailElement) &&
                    thumbnailElement.TryGetProperty("source", out var sourceElement))
                {
                    imageUrl = sourceElement.GetString();
                }

                // Extract the summary description (if available)
                string? shortDescription = null;
                if (root.TryGetProperty("extract", out var extractElement))
                {
                    shortDescription = extractElement.GetString();
                }

                return (wikipediaTitle, wikipediaPageId, imageUrl, shortDescription);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WikipediaLandmarkDAL] Failed to fetch summary for '{title}': {ex.Message}");
                return (null, null, null, null);
            }
        }
        // ------------------------------------------------------------


        /// <summary>
        /// Retrieves the full plain-text description of a Wikipedia article using its title.
        /// Uses the regular MediaWiki API: https://en.wikipedia.org/w/api.php
        /// </summary>
        /// <param name="title">The title of the Wikipedia page (must match existing page)</param>
        /// <returns>The full article text as string, or null if not found</returns>
        public async Task<string?> GetFullDescriptionByTitleAsync(string title)
        {
            try
            {
                var url = $"{WikipediaApiBaseUrl}?action=query&format=json" +
                          $"&prop=extracts&explaintext=true&redirects=1&titles={Uri.EscapeDataString(title)}";

                var response = await _httpClient.GetStringAsync(url);
                var json = JsonDocument.Parse(response);

                var pages = json.RootElement.GetProperty("query").GetProperty("pages");
                foreach (var page in pages.EnumerateObject())
                {
                    if (page.Value.TryGetProperty("extract", out var extractElement))
                    {
                        return extractElement.GetString();
                    }
                }

                return null; // No extract found
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WikipediaLandmarkDAL] Error fetching full description for '{title}': {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Retrieves the full plain-text description of a Wikipedia article using its page ID.
        /// This is more stable and reliable than using a title (in case of redirects or name changes).
        /// </summary>
        /// <param name="pageId">The unique Wikipedia page ID (from the summary API)</param>
        /// <returns>The full article text as string, or null if not found</returns>
        public async Task<(string? Title,string? Description)> GetFullDescriptionByPageIdAsync(string pageId)
        {
            try
            {
                var url = $"{WikipediaApiBaseUrl}?action=query&format=json" +
                        $"&prop=extracts&explaintext=true&redirects=1&pageids={Uri.EscapeDataString(pageId)}";

                var response = await _httpClient.GetStringAsync(url);
                var json = JsonDocument.Parse(response);

                var pages = json.RootElement.GetProperty("query").GetProperty("pages");
                foreach (var page in pages.EnumerateObject())
                {
                    string? title = page.Value.GetProperty("title").GetString();
                    string? description = page.Value.TryGetProperty("extract", out var extractElement)
                        ? extractElement.GetString()
                        : null;

                    return (title, description);
                }

                return (null, null); // No page found
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Wikipedia] Error fetching full description for pageId '{pageId}': {ex.Message}");
                return (null, null);
            }
        }

    }
}
