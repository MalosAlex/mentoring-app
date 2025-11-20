using System.IdentityModel.Tokens.Jwt;
using System.Text;
using MentoringApp.Core.Abstractions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using Microsoft.OpenApi;

namespace MentoringApp.API;

public static class ConfigureServices
{
    public static IServiceCollection ConfigurePresentationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT Authorization header using the Bearer scheme."
            });
            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("bearer", document)] = []
            });
        });

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

        services.AddAuthentication(o =>
        {
           o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
           o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
           o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
           var key = configuration["JWT:Key"];
           if (key == null)
           {
               throw new ArgumentNullException(nameof(key));
           }

           options.TokenValidationParameters = new TokenValidationParameters
           {
               ValidIssuer = configuration["Jwt:Issuer"],
               ValidAudience = configuration["Jwt:Audience"],
               IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
               ValidateIssuer = true,
               ValidateAudience = true,
               ValidateIssuerSigningKey = true,
               ValidateLifetime = true
           };
        });

        services.AddAuthorization();

        return services;
    }
}
