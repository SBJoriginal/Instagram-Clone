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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<Image>()
          .Property(i => i.CreatedAt)
          .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

      modelBuilder.Entity<ApplicationUser>()
          .HasOne(u => u.UserProfile)
          .WithOne(p => p.User)
          .HasPrincipalKey<UserProfile>(u => u.UserId)
          .OnDelete(DeleteBehavior.Cascade);
    }
  }
}
