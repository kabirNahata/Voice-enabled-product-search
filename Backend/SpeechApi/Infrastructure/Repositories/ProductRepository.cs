using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<IEnumerable<Product>> GetAllAsync()
        => await db.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<Product?> GetByIdAsync(Guid id)
        => await db.Products.FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Product>> SearchAsync(ProductSearchFilter filter)
    {
        var query = db.Products.AsNoTracking().Where(p => p.IsActive);

        // Text search across name, description, brand
        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var q = filter.Query.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                p.Description.ToLower().Contains(q) ||
                p.Brand.ToLower().Contains(q) ||
                p.SKU.ToLower().Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(filter.Category))
            query = query.Where(p => p.Category.ToLower() == filter.Category.ToLower());

        if (!string.IsNullOrWhiteSpace(filter.Brand))
            query = query.Where(p => p.Brand.ToLower().Contains(filter.Brand.ToLower()));

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);

        if (filter.MinRating.HasValue)
            query = query.Where(p => p.Rating >= filter.MinRating.Value);

        if (filter.InStockOnly == true)
            query = query.Where(p => p.Stock > 0);

        query = filter.SortBy switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt),
        };

        return await query.ToListAsync();
    }

    public async Task<Product> CreateAsync(Product product)
    {
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        db.Products.Update(product);
        await db.SaveChangesAsync();
        return product;
    }

    public async Task DeleteAsync(Guid id)
    {
        await db.Products
            .Where(p => p.Id == id)
            .ExecuteDeleteAsync();
    }
}