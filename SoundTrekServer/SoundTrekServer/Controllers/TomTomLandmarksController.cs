using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SoundTrekServer.BL;
using SoundTrekServer.Models;

namespace SoundTrekServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TomTomLandmarksController : ControllerBase
    {
        private readonly TomTomLandmarkService _tomtomService;

        // Inject the TomTom API key from config/environment
        public TomTomLandmarksController(IConfiguration config)
        {
            // Load the TomTom API key from configuration (e.g., appsettings.json)
            //var apiKeyTomTom = config["TomTom:ApiKey"] ?? throw new Exception("TomTom API key is missing");
            //_tomtomService = new TomTomLandmarkService(apiKeyTomTom);
            _tomtomService = new TomTomLandmarkService("KxDg0XYcsffShULQ9WaZHruT6IC5dByT");
        }

        /// <summary>
        /// Returns nearby Landmarks based on user's location
        /// </summary>
        /// <param name="lat">Latitude</param>
        /// <param name="lon">Longitude</param>
        /// <param name="radius">Search radius in meters (optional, default = 5000)</param>
        /// <returns>List of Landmarks</returns>
        [HttpGet("nearby")]
        public async Task<ActionResult<List<TomTomLandmark>>> GetNearbyLandmarks(
            [FromQuery] double lat,
            [FromQuery] double lon,
            [FromQuery] int radius = 5000)
        {

            try
            {
                var landmarks = await _tomtomService.GetNearbyLandmarksAsync(lat, lon, radius);

                if (landmarks == null || landmarks.Count == 0)
                {
                    return NotFound("No landmarks found in the specified area.");
                }

                return Ok(landmarks);
            }
            catch (Exception ex)
            {
                // You can also log the error here if needed
                Console.WriteLine($"[Controller Error] {ex.Message}");
                return StatusCode(500, "An error occurred while fetching nearby landmarks.");
            }
        }

        /// <summary>
        /// Returns nearby landmarks based on user's location
        /// </summary>
        /// <param name="lat">Latitude</param>
        /// <param name="lon">Longitude</param>
        /// <param name="radius">Search radius in meters (optional, default = 5000)</param>
        /// <returns>List of landmarks</returns>
        [HttpGet("nearbyWithSummery")]
        public async Task<ActionResult<List<TomTomLandmark>>> GetNearbyLandmarksWithSummery(
            [FromQuery] double lat,
            [FromQuery] double lon,
            [FromQuery] int radius = 5000)
        {

            try
            {
                var landmarks = await _tomtomService.GetNearbyLandmarksWithWikiSummeryAsync(lat, lon, radius);

                if (landmarks == null || landmarks.Count == 0)
                {
                    return NotFound("No landmarks found in the specified area.");
                }

                return Ok(landmarks);
            }
            catch (Exception ex)
            {
                // You can also log the error here if needed
                Console.WriteLine($"[Controller Error] {ex.Message}");
                return StatusCode(500, "An error occurred while fetching nearby landmarks.");
            }
        }

    }
}
