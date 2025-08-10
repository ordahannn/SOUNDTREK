using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using SoundTrekServer.Models;
using SoundTrekServer.Services;

namespace SoundTrekServer.DAL
{
    public class InterestsDAL
    {
        /**
            Retrieves all interests from the database.

            <returns>List of Interest objects</returns>
        **/ 
        public static List<Interest> GetAllInterests()
        {
            List<Interest> interests = new();

            using (SqlConnection con = dbServices.Connect())
            using (SqlCommand cmd = dbServices.CreateStoredProcedure("sp_GetAllInterests", con))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    interests.Add(new Interest
                    {
                        InterestId = (int)reader["InterestId"],
                        InterestName = reader["InterestName"].ToString() ?? ""
                    });
                }
            }

            return interests;
        }
    }
}