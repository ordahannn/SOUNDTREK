namespace SoundTrekServer.Models
{
    public class UpdateUserInterestsRequest
    {
        public int UserId { get; set; }
        public List<int> InterestIds { get; set; } = new List<int>();
    }
}