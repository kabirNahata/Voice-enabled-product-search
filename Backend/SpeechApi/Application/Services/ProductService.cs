using Application.Common;
using Application.Mappers;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services;

public class ProductService(IProductRepository productRepository) : IProductService
{
    public async Task<IEnumerable<Product>> GetAllProductsAsync()
        => await productRepository.GetAllAsync();

    public async Task<Product?> GetProductByIdAsync(Guid id)
        => await productRepository.GetByIdAsync(id);

    public async Task<IEnumerable<Product>> SearchProductsAsync(ProductSearchFilter filter)
        => await productRepository.SearchAsync(filter);

    public async Task<Product> CreateProductAsync(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name))
            throw new AppValidationException("Product name is required.");

        if (product.Price < 0)
            throw new AppValidationException("Price cannot be negative.");

        if (product.Stock < 0)
            throw new AppValidationException("Stock cannot be negative.");

        return await productRepository.CreateAsync(product);
    }

    public async Task<Product> UpdateProductAsync(Product product)
    {
        var existing = await productRepository.GetByIdAsync(product.Id)
            ?? throw new NotFoundException($"Product {product.Id} not found.");

        return await productRepository.UpdateAsync(product);
    }

    public async Task DeleteProductAsync(Guid id)
    {
        var existing = await productRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Product {id} not found.");

        await productRepository.DeleteAsync(id);
    }
}