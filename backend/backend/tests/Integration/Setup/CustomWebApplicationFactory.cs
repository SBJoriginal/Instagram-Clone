using System;
using System.Linq;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace UGram.Tests.Integration.Setup
{
  public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
  {
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
      builder.ConfigureServices(services =>
      {
        var descriptor = services.SingleOrDefault(
                  d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

        if (descriptor != null)
        {
          services.Remove(descriptor);
        }

        services.AddDbContext<AppDbContext>(options =>
              {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
              });

        var sp = services.BuildServiceProvider();

        using (var scope = sp.CreateScope())
        {
          var scopedServices = scope.ServiceProvider;
          var db = scopedServices.GetRequiredService<AppDbContext>();

          db.Database.EnsureCreated();
        }
      });
    }
  }
}
