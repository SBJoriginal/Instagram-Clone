namespace UGram.src.Api
{
  public static class DependencyInjection
  {
    public static IServiceCollection AddWebAPI(this IServiceCollection services)
    {
      services.AddCors(options =>
      {
        options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
      });
      services.AddControllers();
      services.AddEndpointsApiExplorer();
      services.AddSwaggerGen();
      return services;
    }
  }
}
