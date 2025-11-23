using MentoringApp.Persistance.Abstractions;
using MentoringApp.Persistance.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MentoringApp.Persistance;

public static class ConfigureServices
{
    public static IServiceCollection ConfigurePersistanceServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<DataContext>(
            //options => options.UseInMemoryDatabase("MyInMemoryDb")
            );

        services.AddTransient<IUserRepository, UserRepository>();
        services.AddTransient<ICommunityRepository, CommunityRepository>();
        services.AddTransient<IPostRepository, PostRepository>();
        services.AddTransient<IReactionRepository, ReactionRepository>();
        services.AddTransient<ICommentRepository, CommentRepository>();

        return services;
    }
}
