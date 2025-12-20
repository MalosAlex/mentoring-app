using MentoringApp.Persistance.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MentoringApp.Persistance.Context;

internal class DataContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Community> Communities { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<PostReaction> PostReactions { get; set; }
    public DbSet<PostComment> PostComments { get; set; }

    private readonly IConfiguration _configuration;
    public DataContext(DbContextOptions options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.UseSqlServer(_configuration["ConnectionStrings:DefaultConnection"]);

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();

            entity.Property(u => u.FullName).HasMaxLength(100);
            entity.Property(u => u.Username).HasMaxLength(50);
            entity.Property(u => u.Email).HasMaxLength(256);
            
        });

        builder.Entity<Post>(entity =>
        {
            entity.Property(p => p.Caption).IsRequired().HasMaxLength(500);
            entity.Property(p => p.MediaUrl).HasMaxLength(2048);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            entity.HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Community)
                .WithMany(c => c.Posts)
                .HasForeignKey(p => p.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PostReaction>(entity =>
        {
            entity.Property(r => r.ReactionType).IsRequired().HasMaxLength(32);
            entity.Property(r => r.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.HasIndex(r => new { r.PostId, r.UserId }).IsUnique();
            entity.HasOne(r => r.Post)
                  .WithMany()
                  .HasForeignKey(r => r.PostId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.User)
                  .WithMany()
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PostComment>(entity =>
        {
            entity.Property(c => c.Content).IsRequired().HasMaxLength(1000);
            entity.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.HasOne(c => c.Post)
                  .WithMany()
                  .HasForeignKey(c => c.PostId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(c => c.User)
                  .WithMany()
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
