// Models/TomTomLandmark.cs – all relevant fields from TomTom API

namespace SoundTrekServer.Models
{
    public class TomTomLandmark
    {
        // Basic Info
        public string? Id { get; set; } // Unique TomTom POI ID
        public string Name { get; set; } = string.Empty; // fallback default if missing

        // Coordinates
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Metadata
        public List<string>? Categories { get; set; } // e.g. ["museum", "tourist_attraction"]
        public double? Distance { get; set; } // Distance in meters from current location

        // Optional Info
        public string? Address { get; set; } // Full formatted address
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; } // If available from TomTom
        public string? Website { get; set; } // If available
    }
}
