namespace SoundTrekServer.Models
{
    public class LikeUpdateRequest
    {
        public int UserId { get; set; }
        public string PageId { get; set; }
        public bool Liked { get; set; }
    }
}
