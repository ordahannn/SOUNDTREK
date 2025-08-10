using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.BL;
using SoundTrekServer.Models;
using SoundTrekServer.Helpers;
using System.Text.Json;

namespace SoundTrekServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LandmarksController : ControllerBase
    {
        private readonly LandmarkService _landmarkService;

        public LandmarksController(IConfiguration config)
        {
            _landmarkService = new LandmarkService();
        }

        /// <summary>
        /// Returns a list of nearby landmarks, enriched with image and description.
        /// </summary>
        /// <param name="lat">User's latitude</param>
        /// <param name="lon">User's longitude</param>
        /// <param name="radius">Search radius in meters (default: 5000)</param>
        /// <returns>List of Landmark objects</returns>
        [HttpGet("nearby")]
        public async Task<ActionResult<List<Landmark>>> GetNearbyLandmarks(double lat, double lon, int radius)
        {
            Console.WriteLine("[LandmarksController] GetNearbyLandmarks!"); // log

            try
            {
                if (!GeoUtils.IsValidCoordinate(lat, lon))
                    return BadRequest("Invalid user coordinates provided.");

                var landmarks = await _landmarkService.GetNearbyLandmarks(lat, lon, radius);
                return Ok(landmarks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LandmarksController] Error: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching nearby landmarks.");
            }
        }


        /// <summary>
        /// Returns the full Wikipedia Description text for a given page ID.
        /// Called when the user taps on a landmark for more details.
        /// </summary>
        /// <param name="pageId">Wikipedia page ID</param>
        /// <returns>Full plain-text description</returns>

        [HttpGet("description")]
        public async Task<ActionResult> GetFullWikipediaDescription([FromQuery] string pageId)
        {
            try
            {
                var (title, fullDescription) = await _landmarkService.GetFullDescriptionByPageIdAsync(pageId);

                if (string.IsNullOrWhiteSpace(fullDescription))
                {
                    return NotFound(new
                    {
                        Message = "Description not found for the given page ID."
                    });
                }

                // Return JSON object with pageId and cleaned description
                return Ok(new
                {
                    PageId = pageId,
                    Title = title,
                    Description = fullDescription
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LandmarksController] Error: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching landmark Wikipedia full description.");
            }

        }

    }
}
