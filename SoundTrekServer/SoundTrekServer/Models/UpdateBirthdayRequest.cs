namespace SoundTrekServer.Models
{
    public class UpdateBirthdayRequest
    {
        public int UserId { get; set; }
        public DateTime BirthDate { get; set; }
    }
}
