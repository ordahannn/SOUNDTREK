using System;

namespace SoundTrekServer.Models
{
    public class RegisterRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; } = new DateTime(1900, 1, 1);
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PreferredLanguage { get; set; } = "English";
        public string? ProfileImageUrl { get; set; }
        public int SearchRadiusMeters { get; set; } = 5000;
    }
}