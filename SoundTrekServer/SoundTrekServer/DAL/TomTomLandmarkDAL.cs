using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System;
using SoundTrekServer.Models;

namespace SoundTrekServer.DAL
{
    public class TomTomLandmarkDAL
    {
        private readonly HttpClient _httpClient;
        private readonly string _tomtomApiKey;

        public TomTomLandmarkDAL(string tomtomApiKey)
        {
            _tomtomApiKey = tomtomApiKey;
            _httpClient = new HttpClient();
        }

        public async Task<List<TomTomLandmark>> GetLandmarksAsync(double latitude, double longitude, int radiusInMeters = 5000)
        {
            try
            {
                // Define relevant POI categories from TomTom (Tourist landmarks, Museum, etc.)
                // TODO: Add more categories
                string categorySet = "7315,7376,9361,9376";
                
                // Build the API endpoint with coordinates and category filter
                string tomtomAPI = $"https://api.tomtom.com/search/2/nearbySearch/.json" +
                                  $"?lat={latitude}&lon={longitude}&radius={radiusInMeters}" +
                                  $"&categorySet={categorySet}&key={_tomtomApiKey}";

                var response = await _httpClient.GetAsync(tomtomAPI);
                response.EnsureSuccessStatusCode(); // throw if not 200 OK

                var json = await response.Content.ReadAsStringAsync();
                var result = JsonDocument.Parse(json);

                var landmarks = new List<TomTomLandmark>();

                foreach (var item in result.RootElement.GetProperty("results").EnumerateArray())
                {
                    var poi = item.GetProperty("poi");
                    var position = item.GetProperty("position");
                    //var address = item.TryGetProperty("address", out var addr) ? addr : default;
                    var hasAddress = item.TryGetProperty("address", out var address);

                    landmarks.Add(new TomTomLandmark
                    {
                        Id = item.TryGetProperty("id", out var idVal) ? idVal.GetString() : null,                        
                        Name = poi.GetProperty("name").GetString() ?? "Unknown",
                        Latitude = position.GetProperty("lat").GetDouble(),
                        Longitude = position.GetProperty("lon").GetDouble(),
                        Categories = poi.TryGetProperty("categories", out var cats)
                                    ? cats.EnumerateArray()
                                        .Select(c => c.GetString())
                                        .Where(c => !string.IsNullOrWhiteSpace(c))
                                        .Select(c => c!) // We guarantee that it is no longer null
                                        .ToList()
                                    : new List<string>(),
                        Distance = item.TryGetProperty("dist", out var distVal) ? distVal.GetDouble() : null,
                        Address = hasAddress && address.TryGetProperty("freeformAddress", out var addrStr) ? addrStr.GetString() : null,
                        City = hasAddress && address.TryGetProperty("municipality", out var city) ? city.GetString() : null,
                        Country = hasAddress && address.TryGetProperty("country", out var country) ? country.GetString() : null,
                        Phone = poi.TryGetProperty("phone", out var phone) ? phone.GetString() : null,
                        Website = poi.TryGetProperty("url", out var url) ? url.GetString() : null,
                    });
                }

                return landmarks;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[TomTom DAL] Error fetching landmarks: {ex.Message}");
                return new List<TomTomLandmark>(); // return empty list on failure
            }
        }
    }
}
