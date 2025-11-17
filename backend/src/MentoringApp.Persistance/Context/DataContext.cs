using MentoringApp.Persistance.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MentoringApp.Persistance.Context;

internal class DataContext : DbContext
{
    public DbSet<Cat> Cats { get; set; }

    private readonly IConfiguration _configuration;
    public DataContext(DbContextOptions options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.UseSqlServer(_configuration["ConnectionStrings:DefaultConnection"]);
    protected override void OnModelCreating(ModelBuilder builder)
    {

    }
}
