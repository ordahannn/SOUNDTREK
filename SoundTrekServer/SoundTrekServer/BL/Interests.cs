using System.Collections.Generic;
using SoundTrekServer.Models;
using SoundTrekServer.DAL;

namespace SoundTrekServer.BL
{
    public class InterestsBL
    {
        /**
            Gets all available interests.

            <returns>List of Interest objects</returns>
        **/ 
        public List<Interest> GetAll()
        {
            return InterestsDAL.GetAllInterests();
        }
    }
}
