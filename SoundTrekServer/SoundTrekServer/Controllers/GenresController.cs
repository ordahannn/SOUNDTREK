using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SoundTrekServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        // GET: api/<GenresController>
        [HttpGet]
        public ActionResult<List<Genre>> Get()
        {
            var genres = Genre.GetAllGenres();

            if (genres == null || genres.Count == 0)
                return NotFound("No genres found.");

            return Ok(genres);
        }

        // GET api/<GenresController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<GenresController>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<GenresController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<GenresController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
        [HttpGet("image/{genreName}")]

        public async Task<IActionResult> GetGenreImage(string genreName)
        {
            var imageUrl = await Genre.GetGenreImageUrl(genreName);
            if (imageUrl == null)
                return NotFound("Image not found");

            return Ok(new { Genre = genreName, ImageUrl = imageUrl });
        }
    }
}
