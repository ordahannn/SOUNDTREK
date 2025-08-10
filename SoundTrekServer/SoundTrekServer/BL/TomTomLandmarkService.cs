using System.Collections.Generic;
using System.Threading.Tasks;
using SoundTrekServer.Models;
using SoundTrekServer.DAL;
using System.Text.Json;

namespace SoundTrekServer.BL
{
    /// <summary>
    /// Gets Landmarks from TomTom API.
    /// </summary>
    public class TomTomLandmarkService
    {
        private readonly TomTomLandmarkDAL _tomtomDAL;      

        // Constructor receives API key and creates a DAL instance
        public TomTomLandmarkService(string tomtomApiKey)
        {
            _tomtomDAL = new TomTomLandmarkDAL(tomtomApiKey);
        }

        /// <summary>
        /// Gets nearby Landmarks from TomTom based on user coordinates and radius.
        /// </summary>
        /// <param name="latitude">User's latitude</param>
        /// <param name="longitude">User's longitude</param>
        /// <param name="radiusInMeters">Search radius (default 5km)</param>
        /// <returns>List of Landmarks (TomTomLandmark objects: name, coordinates, metadata...)</returns>
        public async Task<List<TomTomLandmark>> GetNearbyLandmarksAsync(double latitude, double longitude, int radiusInMeters = 5000)
        {
            // Call DAL to get data from TomTom API
            var landmarks = await _tomtomDAL.GetLandmarksAsync(latitude, longitude, radiusInMeters);

            // At this stage, we simply return the raw Landmarks from TomTom
            return landmarks;
        }


        /// <summary>
        /// Fetches nearby Landmarks from TomTom and enriches them with image and description from Wikipedia.
        /// </summary>
        /// <param name="latitude">User's current latitude</param>
        /// <param name="longitude">User's current longitude</param>
        /// <param name="radiusInMeters">Search radius (default: 5000m)</param>
        /// <returns>List of enriched Landmarks (JsonElement objects)</returns>
        public async Task<List<JsonElement>> GetNearbyLandmarksWithWikiSummeryAsync(double latitude, double longitude, int radiusInMeters = 5000)
        {
            WikipediaLandmarkDAL wikipediaDAL= new WikipediaLandmarkDAL();
            List<JsonElement> nearbyLandmarks = new List<JsonElement>();

            // Step 1: Get nearby landmarks from TomTom (basic nearby POIs info)
            var tomtomResults = await _tomtomDAL.GetLandmarksAsync(latitude, longitude, radiusInMeters);

            // Step 2: Enrich each landmark with image and description from Wikipedia
            foreach (var poi in tomtomResults)
            {
                // Fetch image and summary from Wikipedia using the place's name
                var (wikiTitle, wikiPageId, imageUrl, description) =
                    await wikipediaDAL.GetSummaryAsync(poi.Name);
                    
                // Skip this landmark if there is no Wikipedia match or no useful content
                if (string.IsNullOrWhiteSpace(wikiPageId) || 
                    (string.IsNullOrWhiteSpace(description) && string.IsNullOrWhiteSpace(imageUrl))){
                        continue; // Don't include this one in the results
                    }

                // Create the JsonElement object with the enriched landmark info
                var landmark = new
                {
                    // TomTom object
                    TomTomLandmark = poi,
                    // Wikipedia info
                    WikipediaLandmarkSummary = new {
                        WikipediaTitle = wikiTitle,
                        WikipediaPageId = wikiPageId,
                        ImageUrl = imageUrl,
                        Description = description
                    }
                    
                };
                // Serialize the object to a JsonElement
                JsonElement landmarkJsonElement = JsonSerializer.SerializeToElement(landmark);

                nearbyLandmarks.Add(landmarkJsonElement);
            }
            
            Console.WriteLine($"[LandmarkService] Fetched {nearbyLandmarks.Count} landmarks out of {tomtomResults.Count} (filtered {tomtomResults.Count - nearbyLandmarks.Count}).");

            return nearbyLandmarks;
        }


    }
}
