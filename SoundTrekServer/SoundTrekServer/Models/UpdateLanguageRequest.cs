namespace SoundTrekServer.Models
{
    public class UpdateLanguageRequest
    {
        public int UserId { get; set; }
        public string LanguageName { get; set; } = string.Empty;
    }
}