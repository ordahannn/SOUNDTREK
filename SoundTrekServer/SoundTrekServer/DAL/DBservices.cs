using System.Data.SqlClient;
using System.Data;
// using BCrypt.Net;
using SoundTrekServer.BL;

namespace SoundTrekServer.DAL
{
    public class DBservices
    {
        public DBservices()
        {
            //
            // TODO: Add constructor logic here
            //
        }

        public SqlConnection Connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }

        public List<Genre> DB_GetAllGenres()
        {
            List<Genre> genres = new List<Genre>();

            // יצירת חיבור למסד נתונים
            SqlConnection con = Connect("myProjDB");

            using (SqlCommand cmd = new SqlCommand("SELECT GenreID, GenreName, GenreImageUrl FROM Genres", con))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    int id = Convert.ToInt32(reader["GenreID"]);
                    string name = reader["GenreName"].ToString();
                    string img = reader["GenreImageUrl"].ToString();

                    // יצירת אובייקט Genre והוספתו לרשימה
                    genres.Add(new Genre(id, name, img));
                }
            }

            con.Close();
            return genres;
        }
        public List<Language> DB_GetAllLanguages()
        {
            List<Language> languages = new List<Language>();
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = Connect("myProjDB"); // יצירת חיבור
            }
            catch (Exception ex)
            {
                throw ex; // טיפול בשגיאה בחיבור
            }

            cmd = CreateCommandWithStoredProcedure("sp_GetAllLanguages", con); // הנחת עבודה שיש SP כזה

            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (dataReader.Read())
                {
                    string languageName = dataReader["LanguageName"].ToString();
                    Language language = new Language(languageName);
                    languages.Add(language);
                }
                return languages;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            return cmd;
        }

    }
}
