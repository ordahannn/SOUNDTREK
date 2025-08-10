using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using SoundTrekServer.DAL;
using SoundTrekServer.Models;

namespace SoundTrekServer.BL
{
    public class UserPreferences
    {

        private readonly GeminiServices _geminiServices;

        public UserPreferences()
        {
            _geminiServices = new GeminiServices();
        }


        // Updates the preferred language of a user.
        public bool UpdatePreferredLanguage(int userId, string languageName)
        {
            return UserPreferencesDAL.UpdatePreferredLanguage(userId, languageName);
        }

        // Updates the search radius for the user.
        public int UpdateSearchRadius(int userId, int radius)
        {
            return UserPreferencesDAL.UpdateSearchRadius(userId, radius);
        }

        // Adds a specific interest to the user.
        public bool AddUserInterest(int userId, int interestId)
        {
            return UserPreferencesDAL.AddUserInterest(userId, interestId);
        }

        // Updates the selected interests for a user.
        public bool UpdateUserInterests(int userId, List<int> interestIds)
        {
            return UserPreferencesDAL.UpdateUserInterests(userId, interestIds);
        }

        // Removes a specific interest from the user.
        public bool RemoveUserInterest(int userId, int interestId)
        {
            return UserPreferencesDAL.RemoveUserInterest(userId, interestId);
        }


        // Updates user details.
        public bool UpdateUserDetails(int userId, string firstName, string lastName, string password, string imageBase64)
        {
            var dal = new UserPreferencesDAL();
            var user = dal.GetUserById(userId);
            if (user == null)
                return false;

            // Only update if a value is provided; otherwise, keep the old one
            string newFirstName = !string.IsNullOrWhiteSpace(firstName) ? firstName : user.FirstName;
            string newLastName = !string.IsNullOrWhiteSpace(lastName) ? lastName : user.LastName;
            string newPassword = !string.IsNullOrWhiteSpace(password) ? password : null; // Null means "do not change password"
            string newImage = !string.IsNullOrWhiteSpace(imageBase64) ? imageBase64 : user.ProfileImageUrl;

            return UserPreferencesDAL.UpdateUserProfile(userId, newFirstName, newLastName, newPassword, newImage);
        }

        // Gets the list of user's interests IDs
        public List<int> GetUserInterests(int userId)
        {
            var userInterests = UserPreferencesDAL.GetUserInterests(userId);
            var interestsIds = userInterests.Select(i => i.InterestId).ToList();

            return interestsIds;
        }

        // Gets the list of user's liked landmarks
        public List<Landmark> GetUserLikedLandmarks(int userId)
        {
            return UserPreferencesDAL.GetUserLikedLandmarks(userId);
        }

        // Removes a specific liked landmark for the user
        public bool RemoveUserLikedLandmark(int userId, string landmarkPageId)
        {
            return UserPreferencesDAL.RemoveUserLikedLandmark(userId, landmarkPageId);
        }

        public DateTime? GetUserBirthday(int userId)
        {
            return UserPreferencesDAL.GetUserBirthday(userId);
        }

        public bool UpdateUserBirthday(int userId, DateTime birthDate)
        {
            return UserPreferencesDAL.UpdateUserBirthday(userId, birthDate);
        }

        public bool UpdateUserLikedLandmark(int userId, string pageId, bool liked)
        {
            return UserPreferencesDAL.UpdateUserLikedLandmark(userId, pageId, liked);
        }


        public bool AddUserLikedLandmark(int userId, Landmark landmark)
        {
            return UserPreferencesDAL.AddUserLikedLandmarkWithInsertIfNotExists(userId, landmark);
        }

       



        public async Task<RecommendationsResponse> GetUserRecommendations(
            int userId,
            double userLat,
            double userLon,
            List<Landmark> nearbyLandmarks
        )
        {
            try
            {
                Console.WriteLine("[UserPreferencesBL] GetUserRecommendations"); //log
                Console.WriteLine($"[UserPreferencesBL] Received {nearbyLandmarks.Count} nearby landmarks"); //log

                var userInterests = UserPreferencesDAL.GetUserInterests(userId) ?? new List<Interest>();
                Console.WriteLine($"[UserPreferencesBL] Received {userInterests.Count} user interests"); //log

                var userLikedLandmarks = UserPreferencesDAL.GetUserLikedLandmarks(userId) ?? new List<Landmark>();
                Console.WriteLine($"[UserPreferencesBL] Received {userLikedLandmarks.Count} liked landmarks"); //log

                var recommendationsResponse = await _geminiServices.CreateUserRecommendationsWithGemini(
                    userLat,
                    userLon,
                    nearbyLandmarks,
                    userLikedLandmarks,
                    userInterests
                );
                
                return recommendationsResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UserPreferencesBL] Error in GetUserRecommendations: {ex.Message}\n{ex.StackTrace}");
                return new RecommendationsResponse();
            }
        }
    }
}