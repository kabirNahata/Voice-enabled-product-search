using Application.DTOs;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Mappers;

public static class ProductMapper
{
    public static ProductResponse ToResponse(Product product) =>
        new(
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.Category,
            product.Brand,
            product.SKU,
            product.Stock,
            product.ImageUrl,
            product.Rating,
            product.IsActive,
            product.CreatedAt
        );

    public static Product ToEntity(CreateProductRequest request) =>
        new()
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Category = request.Category,
            Brand = request.Brand,
            SKU = request.SKU,
            Stock = request.Stock,
            ImageUrl = request.ImageUrl,
            Rating = request.Rating,
            IsActive = request.IsActive,
        };

    public static void ApplyUpdate(Product product, UpdateProductRequest request)
    {
        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Category = request.Category;
        product.Brand = request.Brand;
        product.SKU = request.SKU;
        product.Stock = request.Stock;
        product.ImageUrl = request.ImageUrl;
        product.Rating = request.Rating;
        product.IsActive = request.IsActive;
    }

    public static ProductSearchFilter ToFilter(ProductSearchRequest request) =>
        new()
        {
            Query = request.Query,
            Category = request.Category,
            Brand = request.Brand,
            MinPrice = request.MinPrice,
            MaxPrice = request.MaxPrice,
            MinRating = request.MinRating,
            InStockOnly = request.InStockOnly,
            SortBy = request.SortBy,
        };
}