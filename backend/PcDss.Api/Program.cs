using PcDss.Api.Services;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
});

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var dataDirectory = Path.GetFullPath(builder.Configuration["Dss:DataDirectory"] ?? "DssData",
    AppContext.BaseDirectory);
builder.Services.AddSingleton(new CatalogService(dataDirectory));
builder.Services.AddSingleton(new PredictionService(dataDirectory));
builder.Services.AddSingleton<RecommendationService>();

var app = builder.Build();
app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", storage = "csv" }));

app.Run();
