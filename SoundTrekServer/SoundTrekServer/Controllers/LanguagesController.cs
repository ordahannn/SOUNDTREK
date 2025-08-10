using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SoundTrekServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LanguagesController : ControllerBase
    {
        // GET: api/<LanguagesController>
        [HttpGet]
        public ActionResult<List<Language>> Get()
        {
            var languages = Language.GetAllLanguages();

            if (languages == null || languages.Count == 0)
                return NotFound("No genres found.");

            return Ok(languages);
        }

        // GET api/<LanguagesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<LanguagesController>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<LanguagesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<LanguagesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
