using Application.Services;
using Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<ITranscriptService, TranscriptService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<VoiceSearchService>();         

        return services;
    }
}