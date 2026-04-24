namespace Domain.Interfaces;

public class ProductSearchFilter
{
    public string? Query { get; set; }        // searches name, description, brand
    public string? Category { get; set; }
    public string? Brand { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public float? MinRating { get; set; }
    public bool? InStockOnly { get; set; }
    public string? SortBy { get; set; }       // "price_asc", "price_desc", "rating", "newest"
}