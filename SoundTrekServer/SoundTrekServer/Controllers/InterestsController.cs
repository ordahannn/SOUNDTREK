using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.Models;
using SoundTrekServer.BL;

namespace SoundTrekServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterestsController : ControllerBase
    {
        private readonly InterestsBL _interestsBL = new InterestsBL();

        /**
            Returns all available interests.
        **/
        [HttpGet]
        public ActionResult<List<Interest>> GetAll()
        {
            var interests = _interestsBL.GetAll();

            if (interests == null || interests.Count == 0)
                return NotFound("No interests found.");

            return Ok(interests);
        }
    }
}
