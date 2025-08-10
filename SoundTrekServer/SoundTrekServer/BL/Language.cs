using SoundTrekServer.DAL;

namespace SoundTrekServer.BL
{
    public class Language
    {
        private string name;

        public Language(string name)
        {
            this.name = name;
        }
        public string Name { get => name; set => name = value; }

        public static List<Language> GetAllLanguages()
        {
            DBservices db = new DBservices();
            return db.DB_GetAllLanguages();
        }
    }
}
