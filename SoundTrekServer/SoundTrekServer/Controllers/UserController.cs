using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.BL;
using SoundTrekServer.Models;
using System.Diagnostics;
using SoundTrekServer.Helpers;

namespace SoundTrekServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserPreferences _userBL = new UserPreferences();

        /**
            Updates the preferred language of the user.

            <param name="request">Request body containing UserId and LanguageName</param>
            <returns>HTTP 200 if successful, 404 if user/language invalid</returns>
        **/
        [HttpPut("preferred-language")]
        public IActionResult UpdatePreferredLanguage([FromBody] UpdateLanguageRequest request)
        {
            bool updated = _userBL.UpdatePreferredLanguage(request.UserId, request.LanguageName);

            if (!updated)
                return NotFound("User not found or language invalid");

            return Ok("Preferred language updated successfully");
        }

        /**
            Updates the search radius for the user.

            <param name="request">Request body with UserId and Radius</param>
            <returns>HTTP 200 if successful, 404 if user not found</returns>
        **/
        [HttpPut("radius")]
        public IActionResult UpdateRadius([FromBody] UpdateRadiusRequest request)
        {
            int result = _userBL.UpdateSearchRadius(request.UserId, request.Radius);

            if (result == 0)
                return NotFound("User not found");

            return Ok("Search radius updated successfully");
        }

        /**
            Adds a user interest by interest ID.

            <param name="request">Request body with UserId and InterestId</param>
            <returns>HTTP 200 if added, 400 if already exists or failed</returns>
        **/
        [HttpPost("interest")]
        public IActionResult AddInterest([FromBody] UserInterestRequest request)
        {
            bool added = _userBL.AddUserInterest(request.UserId, request.InterestId);
            return added ? Ok("Interest added") : BadRequest("Failed to add interest");
        }

        /**
            Updates the selected interests for the user.

            <param name="request">Request object with userId and interestIds</param>
            <returns>HTTP result</returns>
        **/
        [HttpPost("update-interests")]
        public IActionResult UpdateUserInterests([FromBody] UpdateUserInterestsRequest request)
        {
            bool success = _userBL.UpdateUserInterests(request.UserId, request.InterestIds);
            return success ? Ok("Interests updated") : BadRequest("Update failed");
        }

        /**
            Removes a user interest by interest ID.

            <param name="request">Request body with UserId and InterestId</param>
            <returns>HTTP 200 if removed, 400 if not found</returns>
        **/
        [HttpDelete("interest")]
        public IActionResult RemoveInterest([FromBody] UserInterestRequest request)
        {
            bool removed = _userBL.RemoveUserInterest(request.UserId, request.InterestId);
            return removed ? Ok("Interest removed") : BadRequest("Failed to remove interest");
        }


        [HttpPut("profile")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            bool updated = _userBL.UpdateUserDetails(
                request.UserId,
                request.FirstName,
                request.LastName,
                request.Password,
                request.ImageBase64
            );

            if (!updated)
                return NotFound("User not found");

            return Ok("User profile updated successfully");
        }


        /// <summary>
        /// Get user's interest IDs as a flat array.
        /// </summary>
        [HttpGet("interest")]
        public IActionResult GetUserInterests([FromQuery] int userId)
        {
            var ids = _userBL.GetUserInterests(userId);
            return Ok(ids); // e.g., [3,5,7]
        }

        /// <summary>
        /// Get all liked landmarks for a user.
        /// </summary>
        [HttpGet("liked-landmarks")]
        public IActionResult GetLikedLandmarks([FromQuery] int userId)
        {
            var landmarks = _userBL.GetUserLikedLandmarks(userId);
            return Ok(landmarks);
        }

        /// <summary>
        /// Remove a liked landmark for a user.
        /// </summary>
        [HttpDelete("liked-landmark")]
        public IActionResult RemoveLikedLandmark([FromQuery] int userId, [FromQuery] string landmarkPageId)
        {
            bool success = _userBL.RemoveUserLikedLandmark(userId, landmarkPageId);
            if (success)
                return Ok("Landmark removed");
            return BadRequest("Failed to remove landmark");
        }

        [HttpGet("birthday")]
        public IActionResult GetUserBirthday([FromQuery] int userId)
        {
            var birthday = _userBL.GetUserBirthday(userId);
            if (birthday == null)
                return NotFound("Birthday not found");
            return Ok(birthday);
        }

        [HttpPut("birthday")]
        public IActionResult UpdateUserBirthday([FromBody] UpdateBirthdayRequest request)
        {
            bool success = _userBL.UpdateUserBirthday(request.UserId, request.BirthDate);
            if (success)
                return Ok("Birthday updated");
            else
                return BadRequest("Failed to update birthday");
        }

        ///// <summary>
        ///// Update the liked status for a landmark for a user.
        ///// </summary>
        //[HttpPost("liked-landmarks")]
        //public IActionResult UpdateLikedLandmark([FromBody] LikeUpdateRequest request)
        //{
        //    if (request == null || request.UserId <= 0 || string.IsNullOrEmpty(request.PageId))
        //        return BadRequest("Invalid request data.");

        //    bool success = _userBL.UpdateUserLikedLandmark(request.UserId, request.PageId, request.Liked);
        //    if (!success)
        //        return StatusCode(500, "Failed to update liked landmark.");

        //    return Ok();
        //}


        [HttpPost("liked-landmarks")]
        public IActionResult UpdateLikedLandmark([FromBody] UserLikedLandmarkRequest request)
        {
            Debug.WriteLine($"UpdateLikedLandmark called with UserId={request?.UserId}, LandmarkPageId={request?.Landmark?.PageId}");

            if (request == null || request.UserId <= 0 || request.Landmark == null || string.IsNullOrEmpty(request.Landmark.PageId))
                return BadRequest("Invalid request data.");

            bool success = _userBL.AddUserLikedLandmark(request.UserId, request.Landmark);

            if (!success)
            {
                Debug.WriteLine("AddUserLikedLandmark returned false.");
                return StatusCode(500, "Failed to update liked landmark.");
            }

            return Ok();
        }



        // ------ User Recommendations ------
        [HttpPost("recommendations")]
        public async Task<ActionResult<RecommendationsResponse>> GetUserRecommendations([FromBody] RecommendationsRequest request)
        {
            try
            {
                Console.WriteLine("[UserController] GetUserRecommendations"); //log
                Console.WriteLine($"[UserController] Recommendations Request: userId={request.UserId}, nearbyLandmarksCount={request.NearbyLandmarks?.Count}"); //log

                // Step 1: Validate input
                if (request == null)
                    return BadRequest("Request body is required.");

                if (request.UserId <= 0)
                    return BadRequest("Invalid UserId provided.");
                
                if (!GeoUtils.IsValidCoordinate(request.UserLat, request.UserLon))
                    return BadRequest("Invalid user coordinates provided.");

                if (request.NearbyLandmarks == null || !request.NearbyLandmarks.Any())
                    return BadRequest("Nearby landmarks list cannot be empty.");

                // step 2: Call User BL (GetUserRecommendations)
                var recommendationsResponse = await _userBL.GetUserRecommendations(
                    request.UserId,
                    request.UserLat,
                    request.UserLon,
                    request.NearbyLandmarks
                );

                // Step 3: Handle null response
                if (recommendationsResponse == null)
                {
                    Console.WriteLine("[UserController] recommendationsResponse returned null"); // log
                    return NotFound();
                }

                Console.WriteLine($"[UserController] Returning {recommendationsResponse.RecommendedLandmarks.Count} landmarks recommendations and route with {recommendationsResponse.RecommendedRoute.Count} stops"); // log

                return Ok(recommendationsResponse);
            }
            catch (Exception ex)
            {
                // Log and return error
                Console.WriteLine($"[UserController] Error: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred while fetching the user's recommendations.");
            }
            
        }
    }
}