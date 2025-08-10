using System.Data;
using System.Data.SqlClient;
using SoundTrekServer.BL;
using SoundTrekServer.Models;
using SoundTrekServer.Services;

namespace SoundTrekServer.DAL
{
    public class CategoriesDAL
    {
        // TODO: use the ServicesServices/dbServices.connect (when updated to System.Data.SqlClient from Microsoft.Data.SqlClient)
        // Creates and opens a SQL connection using the connection string from appsettings.json
        public static SqlConnection Connect(string conString = "myProjDB")
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();

            string? conStr = configuration.GetConnectionString(conString);
            if (string.IsNullOrEmpty(conStr))
                throw new InvalidOperationException($"Missing connection string '{conString}' in appsettings.json");

            SqlConnection con = new SqlConnection(conStr);
            con.Open();

            return con;
        }

        // Returns a SqlCommand configured to run a stored procedure
        public static SqlCommand CreateStoredProcedure(string spName, SqlConnection con)
        {
            return new SqlCommand(spName, con)
            {
                CommandType = CommandType.StoredProcedure,
                CommandTimeout = 10
            };
        }
        // ------------------------------------------------------------


        /// <summary>
        /// Retrieves all Categories using the stored procedure sp_GetAllCategories.
        /// </summary>
        /// <returns>List of Category objects</returns>
        public List<Category> GetAllCategories()
        {
            Console.WriteLine($"[CategoriesDAL] GetAllCategories"); // log

            List<Category> categories = new();

            try
            {
                using SqlConnection con = Connect();
                using SqlCommand cmd = CreateStoredProcedure("sp_GetAllCategories", con);
                using SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (dataReader.Read())
                {
                    categories.Add(new Category
                    {
                        CategoryId = (int)dataReader["CategoryId"],
                        CategoryName = dataReader["CategoryName"].ToString() ?? ""
                    });
                }

                return categories;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesDAL] Error fetching categories from DB: {ex.Message}");
                return categories;
            }
        }


        /// <summary>
        /// Retrieves all category names from the Categories table using the stored procedure sp_GetAllCategoryNames.
        /// </summary>
        /// <returns>List of category names (strings)</returns>
        public List<string> GetAllCategoriesNames()
        {
            Console.WriteLine($"[CategoriesDAL] GetAllCategoriesNames"); // log

            List<string> categoryNames = new();

            try
            {
                using SqlConnection con = Connect();
                using SqlCommand cmd = CreateStoredProcedure("sp_GetAllCategoriesNames", con);
                using SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (dataReader.Read())
                {
                    if (!dataReader.IsDBNull(0))
                    {
                        string? categoryName = dataReader["categoryName"].ToString() ?? "";
                        if (categoryName != "")
                        {
                            categoryNames.Add(categoryName);
                        }
                    }
                }
                return categoryNames;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesDAL] Error fetching categories names from DB: {ex.Message}");
                return categoryNames;
            }
        }

        // --------------------------------------------------------------------
        /// <summary>
        /// Retrieves all CategoriesMainCategories using the stored procedure sp_GetAllCategoryMainCategoryLinks.
        /// </summary>
        /// <returns></returns>
        public List<CategoryMainCategoryLink> GetAllCategoryMainCategoryLinks()
        {
            Console.WriteLine($"[CategoriesDAL] GetAllCategoryMainCategoryLinks"); // log

            List<CategoryMainCategoryLink> categoryMainCategoryLinks = new();

            try
            {
                using SqlConnection con = Connect();
                using SqlCommand cmd = CreateStoredProcedure("sp_GetAllCategoryMainCategoryLinks", con);
                using SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (dataReader.Read())
                {
                    categoryMainCategoryLinks.Add(new CategoryMainCategoryLink
                    {
                        CategoryId = (int)dataReader["CategoryId"],
                        MainCategory = new MainCategory
                        {
                            MainCategoryId = (int)dataReader["MainCategoryId"],
                            MainCategoryName = dataReader["MainCategoryName"].ToString() ?? ""
                        }
                    });
                }

                return categoryMainCategoryLinks;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesDAL] Error fetching categoriesMainCategories from DB: {ex.Message}");
                return categoryMainCategoryLinks;
            }
        }

        /// <summary>
        /// Retrieves all CategoriesInterests using the stored procedure sp_GetAllCategoryInterestLinks.
        /// </summary>
        /// <returns></returns>
        public List<CategoryInterestLink> GetAllCategoryInterestLinks()
        {
            Console.WriteLine($"[CategoriesDAL] GetAllCategoryInterestLinks"); // log

            List<CategoryInterestLink> categoryInterestLinks = new();

            try
            {
                using SqlConnection con = Connect();
                using SqlCommand cmd = CreateStoredProcedure("sp_GetAllCategoryInterestLinks", con);
                using SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (dataReader.Read())
                {
                    categoryInterestLinks.Add(new CategoryInterestLink
                    {
                        CategoryId = (int)dataReader["CategoryId"],
                        Interest = new Interest
                        {
                            InterestId = (int)dataReader["InterestId"],
                            InterestName = dataReader["InterestName"].ToString() ?? ""
                        }
                    });
                }

                return categoryInterestLinks;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesDAL] Error fetching categoriesInterests from DB: {ex.Message}");
                return categoryInterestLinks;
            }
        }
        // --------------------------------------------------------------------

    }
}