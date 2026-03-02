using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using backend.src.Domain.Entities;

namespace Infrastructure.Persistence
{
  public class AppDbContext : IdentityDbContext<ApplicationUser>
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Image> Images { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<Reaction> Reactions { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<Image>()
          .Property(i => i.CreatedAt)
          .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
          .HasDefaultValueSql("CURRENT_TIMESTAMP");

      modelBuilder.Entity<UserProfile>(entity =>
      {
        entity.Property(p => p.SignUpDate)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        entity.HasIndex(p => p.UserName)
            .IsUnique();

        entity.HasIndex(p => p.Email)
            .IsUnique();
      });

      modelBuilder.Entity<ApplicationUser>()
          .HasOne(u => u.UserProfile)
          .WithOne(p => p.User)
          .HasForeignKey<UserProfile>(p => p.UserId)
          .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<Reaction>(entity =>
      {
        entity.HasIndex(r => new { r.ImageId, r.UserId })
            .IsUnique();

        entity.HasOne(r => r.Image)
            .WithMany(i => i.Reactions)
            .HasForeignKey(r => r.ImageId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.Property(r => r.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
      });

      modelBuilder.Entity<Comment>(entity =>
      {
        entity.HasOne(c => c.Image)
            .WithMany(i => i.Comments)
            .HasForeignKey(c => c.ImageId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.Property(c => c.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        entity.Property(c => c.Content)
            .HasMaxLength(500)
            .IsRequired();
      });
    }
  }
}
