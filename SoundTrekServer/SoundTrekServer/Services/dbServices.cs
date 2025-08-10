using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;

namespace SoundTrekServer.Services
{
    public class dbServices
    {
        // Creates and opens a SQL connection using the connection string from appsettings.json
        public static SqlConnection Connect(string conName = "myProjDB")
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();

            string? conStr = configuration.GetConnectionString(conName);
            if (string.IsNullOrEmpty(conStr))
                throw new InvalidOperationException($"Missing connection string '{conName}' in appsettings.json");

            SqlConnection con = new SqlConnection(conStr);
            con.Open();

            return con;
        }

        // Returns a SqlCommand configured to run a stored procedure
        public static SqlCommand CreateStoredProcedure(string name, SqlConnection con)
        {
            return new SqlCommand(name, con)
            {
                CommandType = CommandType.StoredProcedure,
                CommandTimeout = 300
            };
        }
        
        // Executes a stored procedure without returning any result set.
        // Returns number of rows affected (for UPDATE/INSERT/DELETE)
        public static int ExecuteNonQuery(string storedProcName, params SqlParameter[] parameters)
        {
            using (SqlConnection con = Connect())
            using (SqlCommand cmd = CreateStoredProcedure(storedProcName, con))
            {
                cmd.Parameters.AddRange(parameters);
                return cmd.ExecuteNonQuery();
            }
        }
    }
}