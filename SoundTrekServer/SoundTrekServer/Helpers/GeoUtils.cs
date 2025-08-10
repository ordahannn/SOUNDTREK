using System;

namespace SoundTrekServer.Helpers
{
    /// <summary>
    /// Provides utility functions for validating and working with geolocation coordinates (WGS84 standard).
    /// Includes validation for latitude/longitude ranges and optional checks for default (0,0) values.
    /// </summary>
    public static class GeoUtils
    {
        /// <summary>
        /// Validates that latitude and longitude values are within the legal WGS84 range.
        /// Latitude: -90 to +90
        /// Longitude: -180 to +180
        /// </summary>
        /// <param name="lat">Latitude in decimal degrees</param>
        /// <param name="lon">Longitude in decimal degrees</param>
        /// <returns>True if coordinates are valid; false otherwise</returns>
        public static bool IsValidCoordinate(double lat, double lon)
        {
            return IsCoordinateInRange(lat, lon) && IsNonDefaultCoordinate(lat, lon);
        }

        /// <summary>
        /// Validates that latitude and longitude values are within the legal WGS84 range.
        /// Latitude: -90 to +90
        /// Longitude: -180 to +180
        /// </summary>
        /// <param name="lat">Latitude in decimal degrees</param>
        /// <param name="lon">Longitude in decimal degrees</param>
        /// <returns>True if coordinates are within the legal range; false otherwise</returns>
        public static bool IsCoordinateInRange(double lat, double lon)
        {
            return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
        }

        /// <summary>
        /// Optional check to ensure coordinates are not (0,0), which is technically valid
        /// but usually indicates missing or default data.
        /// </summary>
        /// <param name="lat">Latitude</param>
        /// <param name="lon">Longitude</param>
        /// <returns>True if coordinates are not both zero</returns>
        public static bool IsNonDefaultCoordinate(double lat, double lon)
        {
            return !(lat == 0 && lon == 0);
        }
    }
}
