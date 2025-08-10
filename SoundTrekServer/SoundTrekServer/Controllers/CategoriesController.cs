using Microsoft.AspNetCore.Mvc;
using SoundTrekServer.BL;
using SoundTrekServer.Models;

namespace SoundTrekServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoriesServices _categoriesServices;

        public CategoriesController(IConfiguration config)
        {
            _categoriesServices = new CategoriesServices();
        }

        // GET: api/<CategoriesController>
        [HttpGet]
        public ActionResult<List<Category>> GetAllCategories()
        {
            Console.WriteLine($"[CategoriesController] GetAllCategories"); // log
            try
            {
                var categories = _categoriesServices.GetAllCategories();

                if (categories == null || categories.Count == 0)
                    return NotFound("No categories found.");

                return Ok(categories);                
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesController] Error: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching categories.");
            }
        }

        // // GET: api/<CategoriesController>/name
        // [HttpGet("name")]
        // public ActionResult<List<String>> GetAllCategoriesNames()
        // {
        //     Console.WriteLine($"[CategoriesController] GetAllCategoriesNames"); // log
        //     try
        //     {
        //         var categoriesNames = _categoriesServices.GetAllCategoriesNames();

        //         if (categoriesNames == null || categoriesNames.Count == 0)
        //             return NotFound("No categories found.");

        //         return Ok(categoriesNames);
        //     }
        //     catch (Exception ex)
        //     {
        //         Console.WriteLine($"[CategoriesController] Error: {ex.Message}");
        //         return StatusCode(500, "An error occurred while fetching categories names.");
        //     }
        // }
        
    }
}
