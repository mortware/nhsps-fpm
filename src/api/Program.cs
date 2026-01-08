using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO.Converters;

using Fpm.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
  .AddJsonOptions(options =>
  {
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new GeoJsonConverterFactory());
  });

var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
{
  throw new InvalidOperationException("Missing ConnectionStrings:Default. Set ConnectionStrings__Default env var or appsettings.Development.json");
}

builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseNpgsql(connectionString, npgsql => npgsql.UseNetTopologySuite()));

var app = builder.Build();

app.MapControllers();

app.Run();
