namespace Application.DTOs;

public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price,
    string Category,
    string Brand,
    string SKU,
    int Stock,
    string? ImageUrl,
    float? Rating,
    bool IsActive = true
);

public record UpdateProductRequest(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string Category,
    string Brand,
    string SKU,
    int Stock,
    string? ImageUrl,
    float? Rating,
    bool IsActive
);

public record ProductResponse(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string Category,
    string Brand,
    string SKU,
    int Stock,
    string? ImageUrl,
    float? Rating,
    bool IsActive,
    DateTime CreatedAt
);

public record ProductSearchRequest(
    string? Query,
    string? Category,
    string? Brand,
    decimal? MinPrice,
    decimal? MaxPrice,
    float? MinRating,
    bool? InStockOnly,
    string? SortBy
);

public record VoiceSearchRequest(string Transcript);