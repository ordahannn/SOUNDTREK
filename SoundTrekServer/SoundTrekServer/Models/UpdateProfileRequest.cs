namespace SoundTrekServer.Models
{
    public class UpdateProfileRequest
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string? ImageBase64 { get; set; }

    }
}
