using Microsoft.Net.Http.Headers;

namespace MentoringApp.API;

public static class ConfigureServices
{
    public static IServiceCollection ConfigurePresentationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        services.AddControllers();

        services.AddOpenApi();

        services.AddCors(options =>
            options.AddDefaultPolicy(builder =>
            {
                builder.WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                    .WithHeaders(
                        HeaderNames.Accept,
                        HeaderNames.ContentType,
                        HeaderNames.Authorization)
                    .SetIsOriginAllowed(origin =>
                    {
                        if (string.IsNullOrWhiteSpace(origin)) return false;
                        if (origin.ToLower().Contains("localhost:3000")) return true;
                        if (origin.ToLower().StartsWith("https://someone@example.com")) return true; // change when deployed to match real prod url of frontend
                        return false;
                    });
            })
        );

        //services.AddAuthentication(o =>
        //{
        //    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        //    o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        //    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        //}).AddJwtBearer(options =>
        //{
        //    var key = configuration["JWT:Key"];
        //    if (key == null)
        //    {
        //        throw new ArgumentNullException(nameof(key));
        //    }

        //    options.TokenValidationParameters = new TokenValidationParameters
        //    {
        //        ValidIssuer = configuration["JWT:Issuer"],
        //        ValidAudience = configuration["JWT:Audience"],
        //        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
        //        ValidateIssuer = true,
        //        ValidateAudience = true,
        //        ValidateIssuerSigningKey = true,
        //        ValidateLifetime = false
        //    };
        //});

        services.AddAuthorization();

        return services;
    }
}
