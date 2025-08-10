namespace SoundTrekServer.Models
{
    public class AppUser
    {
        // Primary key from DB
        public int UserId { get; set; }
        
        // Basic info
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public string? ProfileImageUrl { get; set; }

        // Contact
        public string Email { get; set; } = string.Empty;

        // Preferences 
        public int SearchRadiusMeters { get; set; }
        public string PreferredLanguage { get; set; } = "English";

        // Creation time 
        public DateTime CreatedAt { get; set; }
    }
}