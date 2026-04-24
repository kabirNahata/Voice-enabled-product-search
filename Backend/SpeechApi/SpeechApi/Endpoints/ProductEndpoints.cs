using Application.Common;
using Application.DTOs;
using Application.Mappers;
using Application.Services;
using Domain.Interfaces;

namespace SpeechApi.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        // GET all
        group.MapGet("/", async (IProductService service) =>
        {
            var products = await service.GetAllProductsAsync();
            return Results.Ok(products.Select(ProductMapper.ToResponse));
        });

        // GET by id
        group.MapGet("/{id:guid}", async (Guid id, IProductService service) =>
        {
            var product = await service.GetProductByIdAsync(id);
            return product is null
                ? Results.NotFound()
                : Results.Ok(ProductMapper.ToResponse(product));
        });

        // POST search (structured filter)
        group.MapPost("/search", async (
            ProductSearchRequest request,
            IProductService service) =>
        {
            var filter = ProductMapper.ToFilter(request);
            var results = await service.SearchProductsAsync(filter);
            return Results.Ok(results.Select(ProductMapper.ToResponse));
        });

        // POST voice search ← the key endpoint
        group.MapPost("/voice-search", async (
            VoiceSearchRequest request,
            IProductService service,
            VoiceSearchService voiceSearchService) =>
        {
            if (string.IsNullOrWhiteSpace(request.Transcript))
                return Results.BadRequest("Transcript cannot be empty.");

            var filter = voiceSearchService.ParseTranscript(request.Transcript);
            var results = await service.SearchProductsAsync(filter);

            return Results.Ok(new
            {
                transcript = request.Transcript,
                parsedFilter = filter,
                results = results.Select(ProductMapper.ToResponse),
                count = results.Count()
            });
        });

        // POST create
        group.MapPost("/", async (CreateProductRequest request, IProductService service) =>
        {
            try
            {
                var entity = ProductMapper.ToEntity(request);
                var created = await service.CreateProductAsync(entity);
                return Results.Created($"/api/products/{created.Id}", ProductMapper.ToResponse(created));
            }
            catch (AppValidationException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        // PUT update
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateProductRequest request,
            IProductService service) =>
        {
            if (id != request.Id)
                return Results.BadRequest("ID mismatch.");
            try
            {
                var existing = await service.GetProductByIdAsync(id);
                if (existing is null) return Results.NotFound();
                ProductMapper.ApplyUpdate(existing, request);
                var updated = await service.UpdateProductAsync(existing);
                return Results.Ok(ProductMapper.ToResponse(updated));
            }
            catch (NotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
            catch (AppValidationException ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        // DELETE
        group.MapDelete("/{id:guid}", async (Guid id, IProductService service) =>
        {
            try
            {
                await service.DeleteProductAsync(id);
                return Results.NoContent();
            }
            catch (NotFoundException ex)
            {
                return Results.NotFound(ex.Message);
            }
        });
    }
}