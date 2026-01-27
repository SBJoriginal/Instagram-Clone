using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Persistence
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Image> Images { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      // Further configuration can go here
      modelBuilder.Entity<Image>()
          .Property(i => i.CreatedAt)
          .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
    }
  }
}
