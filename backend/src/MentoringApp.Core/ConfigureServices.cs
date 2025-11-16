using MentoringApp.Core.Abstractions;
using MentoringApp.Core.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MentoringApp.Core;

public static class ConfigureServices
{
    public static IServiceCollection ConfigureCoreServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddTransient<ICatsService, CatsService>();

        return services;
    }
}
