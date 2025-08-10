using Microsoft.Data.SqlClient;
using SoundTrekServer.Models;
using SoundTrekServer.Services;
using System.Data;
using System.Diagnostics;
using System.Text.Json;

namespace SoundTrekServer.DAL
{
    public class UserPreferencesDAL
    {
        /**
            Updates the preferred language of a user in the database.

            <param name="userId">The ID of the user to update</param>
            <param name="languageName">The new preferred language name</param>
            
            <returns>True if update was successful</returns>
        **/
        public static bool UpdatePreferredLanguage(int userId, string languageName)
        {
            int rowsAffected = dbServices.ExecuteNonQuery("sp_UpdatePreferredLanguage",
                new SqlParameter("@UserId", userId),
                new SqlParameter("@LanguageName", languageName));

            return rowsAffected > 0;
        }

        /**
            Updates the search radius for a user.

            <param name="userId">The ID of the user to update</param>
            <param name="radius">The new search radius in meters</param>
            
            <returns>True if update was successful</returns>
        **/
        public static int UpdateSearchRadius(int userId, int radius)
        {
            using (SqlConnection con = dbServices.Connect())
            using (SqlCommand cmd = dbServices.CreateStoredProcedure("sp_UpdateSearchRadius", con))
            {
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@Radius", radius);

                var returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                returnParameter.Direction = ParameterDirection.ReturnValue;

                cmd.ExecuteNonQuery();

                return (int)returnParameter.Value;
            }
        }


        /**
            Adds a user interest by InterestId.

            <param name="userId">The ID of the user to update</param>
            <param name="interestId">The ID of the interest to add</param>
            
            <returns>True if interest was added</returns>
        **/
        public static bool AddUserInterest(int userId, int interestId)
        {
            int rowsAffected = dbServices.ExecuteNonQuery("sp_AddUserInterest",
                new SqlParameter("@UserId", userId),
                new SqlParameter("@InterestId", interestId));

            return rowsAffected > 0;
        }

        /**
            Updates the selected interests for a user.

            <param name="userId">User ID</param>
            <param name="interestIds">List of interest IDs to set for the user</param>
            
            <returns>True if update was successful</returns>
        **/
        public static bool UpdateUserInterests(int userId, List<int> interestIds)
        {
            try
            {
                using (SqlConnection con = dbServices.Connect())
                using (SqlCommand cmd = dbServices.CreateStoredProcedure("sp_UpdateUserInterests", con))
                {
                    string idsString = string.Join(",", interestIds);

                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@InterestIds", idsString);

                    cmd.ExecuteNonQuery(); // Even if 0 rows affected, we assume it worked
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DAL] UpdateUserInterests failed: {ex.Message}");
                return false;
            }
        }

        /**
            Removes a user interest by InterestId.

            <param name="userId">The ID of the user to update</param>
            <param name="interestId">The ID of the interest to remove</param>
            
            <returns>True if interest was removed</returns>
        **/
        public static bool RemoveUserInterest(int userId, int interestId)
        {
            int rowsAffected = dbServices.ExecuteNonQuery("sp_RemoveUserInterest",
                new SqlParameter("@UserId", userId),
                new SqlParameter("@InterestId", interestId));

            return rowsAffected > 0;
        }

        // Get User By Id
        // Calls sp_GetUserById and returns AppUser on success
        public AppUser? GetUserById(int id)
        {
            using SqlConnection con = dbServices.Connect();
            SqlCommand cmd = dbServices.CreateStoredProcedure("sp_GetUserById", con);

            cmd.Parameters.AddWithValue("@UserId", id);

            try
            {
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    AppUser user = new AppUser
                    {
                        UserId = Convert.ToInt32(reader["UserId"]),
                        FirstName = reader["FirstName"].ToString()!,
                        LastName = reader["LastName"].ToString()!,
                        BirthDate = Convert.ToDateTime(reader["BirthDate"]),
                        Email = reader["Email"].ToString()!,
                        ProfileImageUrl = reader["ProfileImageUrl"]?.ToString() ?? string.Empty,
                        SearchRadiusMeters = Convert.ToInt32(reader["SearchRadiusMeters"]),
                        PreferredLanguage = reader["PreferredLanguage"].ToString() ?? "English",
                        CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                    };

                    return user;
                }

                return null; // Login failed - No match found
            }
            catch (Exception ex)
            {
                Console.WriteLine("Login failed: " + ex.Message);
                throw;
            }
            finally
            {
                con.Close();
            }

        }

        /**
      Updates the user's profile fields (name, password, image, etc).

      <param name="userId">The ID of the user to update</param>
      <param name="firstName">The new first name (or null to leave unchanged)</param>
      <param name="lastName">The new last name (or null to leave unchanged)</param>
      <param name="password">The new password (or null/empty to leave unchanged)</param>
      <param name="imageBase64">A base64-encoded image string (or null/empty to leave unchanged)</param>
      <returns>True if update was successful</returns>
  **/
        public static bool UpdateUserProfile(int userId, string firstName, string lastName, string password, string imageBase64)
        {
            using (SqlConnection con = dbServices.Connect())
            using (SqlCommand cmd = dbServices.CreateStoredProcedure("sp_UpdateUserProfile", con))
            {
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@FirstName", (object)firstName ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@LastName", (object)lastName ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Password", string.IsNullOrWhiteSpace(password) ? (object)DBNull.Value : password);
                cmd.Parameters.AddWithValue("@ImageBase64", string.IsNullOrWhiteSpace(imageBase64) ? (object)DBNull.Value : imageBase64);

                var returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                returnParameter.Direction = ParameterDirection.ReturnValue;

                cmd.ExecuteNonQuery();

                int result = (int)returnParameter.Value;
                return result == 1;
            }
        }

        public static List<Interest> GetUserInterests(int userId)
        {
            var userInterests = new List<Interest>();
            using (var con = dbServices.Connect())
            using (var cmd = dbServices.CreateStoredProcedure("sp_GetUserInterests", con))
            {
                cmd.Parameters.AddWithValue("@UserId", userId);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        userInterests.Add(new Interest
                        {
                            InterestId = reader.GetInt32(reader.GetOrdinal("InterestId")),
                            InterestName = reader.GetString(reader.GetOrdinal("InterestName"))
                        });
                    }
                }
            }
            return userInterests;
        }

        public static List<Landmark> GetUserLikedLandmarks(int userId)
        {
            Console.WriteLine("[UserPreferencesDAL] GetUserLikedLandmarks"); //log
            
            using (var con = dbServices.Connect())
            using (var cmd = dbServices.CreateStoredProcedure("sp_GetUserLikedLandmarks", con))
            {
                cmd.Parameters.AddWithValue("@UserId", userId);

                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        if (reader.IsDBNull(0))
                        {
                            return new List<Landmark>();
                        }
                        // Column name is "JsonResult"
                        string json = reader.GetString(0);

                        var landmarks = JsonSerializer.Deserialize<List<Landmark>>(json, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        return landmarks ?? new List<Landmark>();
                    }
                }
            }

            return new List<Landmark>();

        }


        // public static List<Landmark> GetUserLikedLandmarks(int userId)
        // {
        //     var likedLandmarks = new List<Landmark>();

        //     using (var con = dbServices.Connect())
        //     using (var cmd = dbServices.CreateStoredProcedure("sp_GetUserLikedLandmarks", con))
        //     {
        //         cmd.Parameters.AddWithValue("@UserId", userId);

        //         using (var reader = cmd.ExecuteReader())
        //         {
        //             while (reader.Read())
        //             {
        //                 likedLandmarks.Add(new Landmark
        //                 {
        //                     PageId = reader["LandmarkPageId"]?.ToString() ?? string.Empty,
        //                     Title = reader["Title"]?.ToString() ?? string.Empty,
        //                     ImageUrl = reader["ImageUrl"] as string
        //                 });
        //             }
        //         }
        //     }
        //     return likedLandmarks;
        // }

        public static bool RemoveUserLikedLandmark(int userId, string pageId)
        {
            try
            {
                using (var con = dbServices.Connect())
                using (var cmd = dbServices.CreateStoredProcedure("sp_RemoveUserLikedLandmark", con))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@LandmarkPageId", pageId);
                    cmd.ExecuteNonQuery();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DAL] RemoveUserLikedLandmark failed: {ex.Message}");
                return false;
            }
        }

        public static DateTime? GetUserBirthday(int userId)
        {
            DateTime? birthday = null;
            using (var con = dbServices.Connect())
            using (var cmd = dbServices.CreateStoredProcedure("sp_GetUserBirthday", con))
            {
                cmd.Parameters.AddWithValue("@UserId", userId);
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        if (!reader.IsDBNull(0))
                            birthday = reader.GetDateTime(0);
                    }
                }
            }
            return birthday;
        }

        public static bool UpdateUserBirthday(int userId, DateTime birthDate)
        {
            try
            {
                using (var con = dbServices.Connect())
                using (var cmd = dbServices.CreateStoredProcedure("sp_UpdateUserBirthday", con))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@BirthDate", birthDate);
                    cmd.ExecuteNonQuery();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DAL] UpdateUserBirthday failed: {ex.Message}");
                return false;
            }
        }

        public static bool UpdateUserLikedLandmark(int userId, string pageId, bool liked)
        {
            try
            {
                using (var con = dbServices.Connect())
                using (var cmd = dbServices.CreateStoredProcedure(liked ? "sp_AddUserLikedLandmark" : "sp_RemoveUserLikedLandmark", con))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@PageId", pageId);
                    cmd.ExecuteNonQuery();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DAL] UpdateUserLikedLandmark failed: {ex.Message}");
                return false;
            }
        }


        public static bool AddUserLikedLandmarkWithInsertIfNotExists(int userId, Landmark landmark)
        {
            try
            {
                using var con = dbServices.Connect();


                using var tran = con.BeginTransaction();

                using (var cmdCheck = dbServices.CreateStoredProcedure("sp_CheckLandmarkExists", con))
                {
                    cmdCheck.Transaction = tran;
                    cmdCheck.Parameters.AddWithValue("@LandmarkPageId", landmark.PageId);

                    var existsObj = cmdCheck.ExecuteScalar();
                    Debug.WriteLine($"sp_CheckLandmarkExists returned: {existsObj}");
                    bool exists = existsObj != null && Convert.ToInt32(existsObj) > 0;

                    if (!exists)
                    {
                        using var cmdInsert = dbServices.CreateStoredProcedure("sp_InsertLandmark", con);
                        cmdInsert.Transaction = tran;

                        cmdInsert.Parameters.AddWithValue("@LandmarkPageId", landmark.PageId);
                        cmdInsert.Parameters.AddWithValue("@Title", landmark.Title);
                        cmdInsert.Parameters.AddWithValue("@Latitude", landmark.Lat);
                        cmdInsert.Parameters.AddWithValue("@Longitude", landmark.Lon);
                        cmdInsert.Parameters.AddWithValue("@ImageUrl", (object?)landmark.ImageUrl ?? DBNull.Value);
                        cmdInsert.Parameters.AddWithValue("@ShortDescription", (object?)landmark.ShortDescription ?? DBNull.Value);

                        int rows = cmdInsert.ExecuteNonQuery();
                        Debug.WriteLine($"sp_InsertLandmark affected {rows} rows.");
                    }
                }

                if (landmark.Categories != null && landmark.Categories.Count > 0)
                {
                    foreach (var category in landmark.Categories)
                    {
                        using var cmdCategory = dbServices.CreateStoredProcedure("sp_AddLandmarkCategory", con);
                        cmdCategory.Transaction = tran;

                        cmdCategory.Parameters.AddWithValue("@LandmarkPageId", landmark.PageId);
                        cmdCategory.Parameters.AddWithValue("@CategoryId", category.CategoryId);

                        cmdCategory.ExecuteNonQuery();
                    }
                }

                using var cmdAddLike = dbServices.CreateStoredProcedure("sp_AddUserLikedLandmark", con);
                cmdAddLike.Transaction = tran;

                cmdAddLike.Parameters.AddWithValue("@UserId", userId);
                cmdAddLike.Parameters.AddWithValue("@LandmarkPageId", landmark.PageId);

                int likedRows = cmdAddLike.ExecuteNonQuery();
                Debug.WriteLine($"sp_AddUserLikedLandmark affected {likedRows} rows.");

                tran.Commit();
                Debug.WriteLine("Transaction committed successfully.");
                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine("Exception caught in AddUserLikedLandmarkWithInsertIfNotExists:");
                Debug.WriteLine(ex.ToString());
                return false;
            }
        }








    }
}