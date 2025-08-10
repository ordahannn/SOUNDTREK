using System;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using SoundTrekServer.Models;
using SoundTrekServer.Services;

namespace SoundTrekServer.DAL {

    // Handles authentication-related database actions //

    public class Authentication
    {
        // LOGIN
        // Calls sp_LoginUser and returns AppUser on success
        public AppUser? Login(string email, string password)
        {
            using SqlConnection con = dbServices.Connect();
            SqlCommand cmd = dbServices.CreateStoredProcedure("sp_LoginUser", con);

            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@Password", password);

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

        // REGISTER
        // Calls sp_RegisterUser to insert a new user
        public AppUser? Register(AppUser user, string password)
        {
            try
            {
                if (IsEmailTaken(user.Email))
                    return null;

                using SqlConnection con = dbServices.Connect();
                SqlCommand cmd = dbServices.CreateStoredProcedure("sp_RegisterUser", con);

                cmd.Parameters.AddWithValue("@FirstName", user.FirstName);
                cmd.Parameters.AddWithValue("@LastName", user.LastName);
                cmd.Parameters.AddWithValue("@Email", user.Email);
                cmd.Parameters.AddWithValue("@Password", password);
                cmd.Parameters.AddWithValue("@BirthDate", user.BirthDate);
                cmd.Parameters.AddWithValue("@PreferredLanguage", user.PreferredLanguage);
                cmd.Parameters.AddWithValue("@SearchRadiusMeters", user.SearchRadiusMeters);
                cmd.Parameters.AddWithValue("@ProfileImageUrl", user.ProfileImageUrl ?? string.Empty);

                using SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new AppUser
                    {
                        UserId = Convert.ToInt32(reader["UserId"]),
                        FirstName = reader["FirstName"].ToString()!,
                        LastName = reader["LastName"].ToString()!,
                        BirthDate = Convert.ToDateTime(reader["BirthDate"]),
                        Email = reader["Email"].ToString()!,
                        ProfileImageUrl = reader["ProfileImageUrl"]?.ToString() ?? string.Empty,
                        SearchRadiusMeters = Convert.ToInt32(reader["SearchRadiusMeters"]),
                        PreferredLanguage = reader["PreferredLanguage"]?.ToString() ?? "English",
                        CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Registration failed: " + ex.Message);
                return null;
            }
        }

        // CHECK IF EMAIL EXISTS
        // Checks if email already exists via sp_CheckEmailExists
        public bool IsEmailTaken(string email)
        {
            using SqlConnection con = dbServices.Connect();
            SqlCommand cmd = dbServices.CreateStoredProcedure("sp_CheckEmailExists", con);

            cmd.Parameters.AddWithValue("@Email", email);

            try
            {
                object? result = cmd.ExecuteScalar();
                return result != null && Convert.ToInt32(result) > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Email check failed: " + ex.Message);
                throw;
            }
        }

        // GET USER BY ID
        // Gets user info by ID using sp_GetUserById
        public AppUser? GetUserById(int userId)
        {
            using SqlConnection con = dbServices.Connect();
            SqlCommand cmd = dbServices.CreateStoredProcedure("sp_GetUserById", con);

            cmd.Parameters.AddWithValue("@UserId", userId);

            try
            {
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new AppUser
                    {
                        UserId = userId,
                        FirstName = reader["FirstName"].ToString()!,
                        LastName = reader["LastName"].ToString()!,
                        BirthDate = Convert.ToDateTime(reader["BirthDate"]),
                        Email = reader["Email"].ToString()!,
                        ProfileImageUrl = reader["ProfileImageUrl"]?.ToString() ?? string.Empty,
                        SearchRadiusMeters = Convert.ToInt32(reader["SearchRadiusMeters"]),
                        PreferredLanguage = reader["PreferredLanguage"].ToString() ?? "English",
                        CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failed to fetch user: " + ex.Message);
                throw;
            }
        }
    }
}