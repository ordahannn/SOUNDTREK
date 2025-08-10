using SoundTrekServer.DAL;
using SoundTrekServer.Models;

namespace SoundTrekServer.BL
{
    public class Auth
    {
        private readonly Authentication _authDAL;
        public Auth()
        {
            _authDAL = new Authentication();
        }

        // Attempt login via DAL
        public AppUser? Login(string email, string password)
        {
            return _authDAL.Login(email, password);
        }

        // Registers a user if email is not already taken
        public AppUser? Register(AppUser user, string password)
        {
            return _authDAL.Register(user, password);
        }

        // Gets user info by unique ID
        public AppUser? GetUserById(int userId)
        {
            return _authDAL.GetUserById(userId);
        }

        // Check if email is already registered
        public bool IsEmailTaken(string email)
        {
            return _authDAL.IsEmailTaken(email);
        }
    }
}