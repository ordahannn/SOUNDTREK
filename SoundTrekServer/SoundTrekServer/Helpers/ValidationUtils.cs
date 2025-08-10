using System;
using SoundTrekServer.Models;

namespace SoundTrekServer.Helpers
{
    /// <summary>
    /// Utility class for validating and cleaning collections of Landmarks, Categories, MainCategories, and Interests.
    /// These methods ensure that the data used across the system is valid, consistent, and safe to process.
    /// </summary>
    public static class ValidationUtils
    {

        /// <summary>
        /// Validates a list of Wikipedia landmarks to ensure each landmark has required data and valid coordinates.
        /// </summary>
        /// <param name="landmarks">List of Wikipedia landmarks to validate</param>
        /// <returns>A cleaned list of valid Wikipedia landmarks</returns>
        public static List<WikipediaLandmark> ValidateWikipediaLandmarks(List<WikipediaLandmark> landmarks)
        {
            if (landmarks == null) return new List<WikipediaLandmark>();

            var validatedLandmarks = landmarks.Where(l =>
                    // Check that the landmark object is not null
                    l != null &&
                    // Ensure PageId is provided
                    !string.IsNullOrWhiteSpace(l.PageId) &&
                    // Ensure Title is provided
                    !string.IsNullOrWhiteSpace(l.Title) &&
                    // Validate coordinates using GeoUtils helper
                    GeoUtils.IsValidCoordinate(l.Lat, l.Lon) &&
                    // Ensure short description is provided
                    !string.IsNullOrWhiteSpace(l.ShortDescription)
                )
                .ToList();

            return validatedLandmarks;
        }


        /// <summary>
        /// Validates a list of landmarks to ensure each landmark has required data and valid coordinates.
        /// Also cleans null or invalid entries from associated MainCategories and Categories.
        /// </summary>
        /// <param name="landmarks">List of landmarks to validate</param>
        /// <returns>A cleaned list of landmarks, with invalid items removed and nested collections cleaned</returns>
        public static List<Landmark> ValidateLandmarks(List<Landmark> landmarks)
        {
            if (landmarks == null) return new List<Landmark>();

            var validatedLandmarks = landmarks.Where(l =>
                    // Check that the landmark object is not null
                    l != null &&
                    // Ensure PageId is provided
                    !string.IsNullOrWhiteSpace(l.PageId) &&
                    // Ensure Title is provided
                    !string.IsNullOrWhiteSpace(l.Title) &&
                    // Validate coordinates using GeoUtils helper
                    GeoUtils.IsValidCoordinate(l.Lat, l.Lon) &&
                    // Ensure short description is provided
                    !string.IsNullOrWhiteSpace(l.ShortDescription)
                )
                .Select(l =>
                {
                    // Remove any null or invalid main categories
                    l.MainCategories = (l.MainCategories ?? new List<MainCategory>())
                        .Where(mc => mc != null && !string.IsNullOrWhiteSpace(mc.MainCategoryName))
                        .ToList();

                    // Remove any null or invalid categories
                    l.Categories = (l.Categories ?? new List<Category>())
                        .Where(c => c != null && !string.IsNullOrWhiteSpace(c.CategoryName))
                        .ToList();

                    return l;
                })
                .ToList();

            return validatedLandmarks;
        }

        /// <summary>
        /// Validates a list of interests to ensure each interest object is not null
        /// and contains a valid, non-empty name.
        /// </summary>
        /// <param name="interests">List of interests to validate</param>
        /// <returns>A cleaned list of valid interests</returns>
        public static List<Interest> ValidateInterests(List<Interest> interests)
        {
            if (interests == null) return new List<Interest>();

            var validatedInterests = interests
                .Where(i =>
                    // Ensure interest object is not null and has a valid name
                    i != null &&
                    !string.IsNullOrWhiteSpace(i.InterestName)
                )
                .ToList();

            return validatedInterests;
        }

        /// <summary>
        /// Validates a list of categories to ensure each category is not null,
        /// has a valid positive ID, and contains a valid name.
        /// </summary>
        /// <param name="categories">List of categories to validate</param>
        /// <returns>A cleaned list of valid categories</returns>
        public static List<Category> ValidateCategories(List<Category> categories)
        {
            if (categories == null) return new List<Category>();

            var validatedCategories = categories
                .Where(c =>
                    // Ensure category object is not null, has a valid ID, and non-empty name
                    c != null &&
                    c.CategoryId > 0 &&
                    !string.IsNullOrWhiteSpace(c.CategoryName)
                )
                .ToList();

            return validatedCategories;
        }

        /// <summary>
        /// Validates a list of main categories to ensure each main category is not null,
        /// has a valid positive ID, and contains a valid name.
        /// </summary>
        /// <param name="mainCategories">List of main categories to validate</param>
        /// <returns>A cleaned list of valid main categories</returns>
        public static List<MainCategory> ValidateMainCategories(List<MainCategory> mainCategories)
        {
            if (mainCategories == null) return new List<MainCategory>();

            var validatedMainCategories = mainCategories
                .Where(mc =>
                    // Ensure main category object is not null, has a valid ID, and non-empty name
                    mc != null &&
                    mc.MainCategoryId > 0 &&
                    !string.IsNullOrWhiteSpace(mc.MainCategoryName)
                )
                .ToList();

            return validatedMainCategories;
        }
    }
}
