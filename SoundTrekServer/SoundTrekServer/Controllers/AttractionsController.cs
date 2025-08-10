using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SoundTrekServer.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SoundTrekServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttractionsController : ControllerBase
    {
        // GET: api/<AttractionsController>
        [HttpGet]
        public async Task<string> Get()
        {    
            string attractionJson =  await Attraction.AttractionProcess("English" , 32.47604177811533, 34.97378575771483, 5000);
            return attractionJson;

        }

        // GET api/<AttractionsController>/5
        [HttpPost("ai")]
        public async Task<string> Get([FromBody] string[] value)
        {
            string description = value[0];
            string genre = value[1];
            string language = value[2];
            return await Attraction.AiGenerate(description, genre, language);
        }

        // POST api/<AttractionsController>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<AttractionsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<AttractionsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
