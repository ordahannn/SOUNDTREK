//var builder = WebApplication.CreateBuilder(args);

//// added CORS
//builder.Services.AddCors(options =>
//{
//    options.AddDefaultPolicy(policy =>
//    {
//        policy
//            .AllowAnyOrigin()
//            .AllowAnyMethod()
//            .AllowAnyHeader();
//    });
//});

//// Add services to the container.

//builder.Services.AddControllers();
//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//var app = builder.Build();

//app.Urls.Add("http://0.0.0.0:7109"); // added

//// Use CORS before anything else
//app.UseCors();


//// Configure the HTTP request pipeline.
//if (true)
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();
//app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

//app.UseAuthorization();

//app.MapControllers();

//app.Run();



var builder = WebApplication.CreateBuilder(args);

// ????? AppSettings ?? IConfiguration
AppSettings.Initialize(builder.Configuration);

// Add Kestrel URL binding here
builder.WebHost.UseUrls("http://0.0.0.0:7109");

// added CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use CORS before anything else
app.UseCors();

if (true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
