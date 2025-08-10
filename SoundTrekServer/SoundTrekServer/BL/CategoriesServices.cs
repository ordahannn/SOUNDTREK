using SoundTrekServer.DAL;
using SoundTrekServer.Models;

namespace SoundTrekServer.BL
{
    public class CategoriesServices
    {
        private readonly CategoriesDAL _categoriesDAL;

        // Cache storage
        private List<Category> _categoriesCache;
        private List<CategoryMappings> _categoryMappingsCache;
        private DateTime _lastCacheUpdate = DateTime.MinValue;
        private readonly TimeSpan _cacheTtl = TimeSpan.FromDays(7); // Cache valid for 7 days
        private static readonly object _lock = new();

        public CategoriesServices()
        {
            _categoriesDAL = new CategoriesDAL();
        }

        /// <summary>
        /// Loads categories and mappings (Category → MainCategory/Interest) from the database into memory cache.
        /// This method refreshes the cache only if:
        ///  - The cache is expired (based on TTL)
        ///  - Or if forceRefresh = true (manual refresh)
        /// Thread-safe: Uses a lock to prevent concurrent cache rebuilds.
        /// </summary>
        private void LoadCategoriesCache(bool forceRefresh = false)
        {
            lock (_lock) // Ensure thread-safety when accessing or updating cache
            {
                // Check if refresh is needed:
                // - If forceRefresh is false
                // - And cache objects are already populated
                // - And cache is still valid (not expired based on TTL)
                if (!forceRefresh && 
                    _categoriesCache != null && 
                    _categoryMappingsCache != null && 
                    DateTime.UtcNow - _lastCacheUpdate < _cacheTtl)
                {
                    Console.WriteLine("[CategoriesServices] Using existing categories cache (still valid).");
                    return; // Cache is valid – no need to reload from DB
                }

                Console.WriteLine("[CategoriesServices] Refreshing categories cache...");

                try
                {
                    // Load fresh data from the database
                    var categories = _categoriesDAL.GetAllCategories();
                    var mappings = BuildCategoryMappings();

                    // If data could not be retrieved, keep previous cache (avoid clearing valid data)
                    if (categories == null || mappings == null)
                    {
                        Console.WriteLine("[CategoriesServices] Failed to refresh cache – keeping previous data.");
                        return;
                    }

                    // Update cache and refresh timestamp
                    _categoriesCache = categories;
                    _categoryMappingsCache = mappings;
                    _lastCacheUpdate = DateTime.UtcNow;

                    Console.WriteLine("[CategoriesServices] Cache updated successfully.");
                }
                catch (Exception ex)
                {
                    // In case of error, log the exception but do NOT clear the existing cache
                    Console.WriteLine($"[CategoriesServices] Error refreshing cache: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Returns cached categories (Category list).
        /// If cache is expired or empty, it triggers LoadCategoriesCache() to refresh it.
        /// Optional parameter forceRefresh = true can force a reload from the database.
        /// </summary>
        public List<Category> GetCachedCategories(bool forceRefresh = false)
        {
            // Ensure cache is up to date (refresh if needed)
            LoadCategoriesCache(forceRefresh);

            // Return cached categories (fallback: empty list if cache is unavailable)
            return _categoriesCache ?? new List<Category>();
        }

        /// <summary>
        /// Returns cached category mappings (Category → MainCategory/Interest).
        /// If cache is expired or empty, it triggers LoadCategoriesCache() to refresh it.
        /// Optional parameter forceRefresh = true can force a reload from the database.
        /// </summary>
        public List<CategoryMappings> GetCachedCategoryMappings(bool forceRefresh = false)
        {
            // Ensure cache is up to date (refresh if needed)
            LoadCategoriesCache(forceRefresh);

            // Return cached category mappings (fallback: empty list if cache is unavailable)
            return _categoryMappingsCache ?? new List<CategoryMappings>();
        }


        /// <summary>
        /// Build mappings (Category -> MainCategory/Interest).
        /// </summary>
        private List<CategoryMappings> BuildCategoryMappings()
        {
            var result = new List<CategoryMappings>();

            try
            {
                // 1. Retrieve all mapping links from the database:
                // - Category -> MainCategory
                // - Category -> Interest
                var categoryMainCategoryLinks = _categoriesDAL.GetAllCategoryMainCategoryLinks();
                var categoryInterestLinks = _categoriesDAL.GetAllCategoryInterestLinks();

                // 2. Create a dictionary to map CategoryId -> CategoryMappings object
                var grouped = new Dictionary<int, CategoryMappings>();

                // 3. Process MainCategory links
                // MainCategory links
                foreach (var link in categoryMainCategoryLinks)
                {
                    // If this CategoryId does not exist in the dictionary yet, initialize it
                    if (!grouped.ContainsKey(link.CategoryId))
                        grouped[link.CategoryId] = new CategoryMappings { CategoryId = link.CategoryId };

                    // Add the MainCategory only if it's not already present (avoid duplicates)
                    if (!grouped[link.CategoryId].MainCategories.Any(mc => mc.MainCategoryId == link.MainCategory.MainCategoryId))
                        grouped[link.CategoryId].MainCategories.Add(link.MainCategory);
                }

                // 4. Process Interest links
                // Interest links
                foreach (var link in categoryInterestLinks)
                {
                    // If this CategoryId does not exist in the dictionary yet, initialize it
                    if (!grouped.ContainsKey(link.CategoryId))
                        grouped[link.CategoryId] = new CategoryMappings { CategoryId = link.CategoryId };

                    // Add the Interest only if it's not already present (avoid duplicates)
                    if (!grouped[link.CategoryId].Interests.Any(i => i.InterestId == link.Interest.InterestId))
                        grouped[link.CategoryId].Interests.Add(link.Interest);
                }

                // 5. Convert the dictionary values to a list
                result = grouped.Values.ToList();
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesServices] Error in BuildCategoryMappings: {ex.Message}");
                return null;
            }
        }



        /// <summary>
        /// Retrieves all available categories from DB.
        /// Each category includes id and name.
        /// </summary>
        /// <returns>List of Categories objects</returns>
        public List<Category> GetAllCategories()
        {
            Console.WriteLine($"[CategoriesServices] GetAllCategories"); // log
            var categories = new List<Category>();

            try
            {
                categories = _categoriesDAL.GetAllCategories();
                return categories;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesServices] Error in GetAllCategories: {ex.Message}");
                throw;
            }
        }



        // ---------------- TODO: Delete if not in use ----------------
        /// <summary>
        /// Retrieves all available categories names from DB.
        /// </summary>
        /// <returns>List of Categories names (string objects)</returns>
        public List<String> GetAllCategoriesNames()
        {
            Console.WriteLine($"[CategoriesServices] GetAllCategoriesNames"); // log
            var categoriesNames = new List<String>();

            try
            {
                categoriesNames = _categoriesDAL.GetAllCategoriesNames();
                return categoriesNames;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesServices] Error in GetAllCategoriesNames: {ex.Message}");
                throw;
            }
        }
        // --------------------------------------------------------------------


        // ---------------- TODO: Delete if GetAllCategoryMappings works ----------------
        /// <summary>
        /// </summary>
        /// <returns></returns>
        public List<CategoryMainCategoryLink> GetAllCategoryMainCategoryLinks()
        {
            Console.WriteLine($"[CategoriesServices] GetAllCategoryMainCategoryLinks"); // log
            var categoryMainCategoryLinks = new List<CategoryMainCategoryLink>();

            try
            {
                categoryMainCategoryLinks = _categoriesDAL.GetAllCategoryMainCategoryLinks();
                return categoryMainCategoryLinks;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesServices] Error in GetAllCategoryMainCategoryLinks: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// </summary>
        /// <returns></returns>
        public List<CategoryInterestLink> GetAllCategoryInterestLinks()
        {
            Console.WriteLine($"[CategoriesServices] GetAllCategoryInterestLinks"); // log
            var categoryInterestLinks = new List<CategoryInterestLink>();

            try
            {
                categoryInterestLinks = _categoriesDAL.GetAllCategoryInterestLinks();
                return categoryInterestLinks;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesServices] Error in GetAllCategoryInterestLinks: {ex.Message}");
                throw;
            }
        }
        // --------------------------------------------------------------------

        public List<CategoryMappings> GetAllCategoryMappings()
        {
            Console.WriteLine($"[CategoriesServices] GetAllCategoryMappings"); // log

            var result = new List<CategoryMappings>();

            try
            {
                // Build Category Mappings
                result = BuildCategoryMappings();
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesServices] Error in GetAllCategoryMappings: {ex.Message}");
                throw;
            }
        }
    }
}