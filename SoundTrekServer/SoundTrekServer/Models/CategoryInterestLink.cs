namespace SoundTrekServer.Models
{
    public class CategoryInterestLink
    {
        public int CategoryId { get; set; }
        public Interest Interest { get; set; } = null!;
    }
}
