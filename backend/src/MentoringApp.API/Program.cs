using MentoringApp.API;
using MentoringApp.API.Middleware;
using MentoringApp.Core;
using MentoringApp.Persistance;

public partial class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.ConfigurePresentationServices(builder.Configuration);
        builder.Services.ConfigureCoreServices(builder.Configuration);
        builder.Services.ConfigurePersistanceServices(builder.Configuration);

        builder.Services.AddHealthChecks();

        var app = builder.Build();

        app.MapHealthChecks("/health");

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseCors();

        app.UseAuthentication();
        app.UseMiddleware<TokenBlacklistMiddleware>();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}