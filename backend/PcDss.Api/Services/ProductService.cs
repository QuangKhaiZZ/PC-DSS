using Microsoft.EntityFrameworkCore;
using PcDss.Api.Data;
using PcDss.Api.DTOs.Products;
using PcDss.Api.Models;
using PcDss.Api.Services.Interfaces;

namespace PcDss.Api.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _dbContext;

    public ProductService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await QueryResponses()
            .OrderBy(product => product.ProductName)
            .ThenBy(product => product.ProductId)
            .ToListAsync(cancellationToken);
    }

    public Task<ProductResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return QueryResponses()
            .SingleOrDefaultAsync(
                product => product.ProductId == id,
                cancellationToken);
    }

    public Task<bool> CodeExistsAsync(
        string productCode,
        int? excludedProductId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = productCode.Trim();

        return _dbContext.Products.AnyAsync(
            product => product.ProductCode == normalizedCode
                && (!excludedProductId.HasValue
                    || product.ProductId != excludedProductId.Value),
            cancellationToken);
    }

    public async Task<ProductResponse> CreateAsync(
        ProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var product = new Product
        {
            CategoryId = request.CategoryId
        };

        ApplyRequest(product, request);

        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(product.ProductId, cancellationToken))!;
    }

    public async Task<ProductResponse?> UpdateAsync(
        int id,
        ProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products.FindAsync(
            [id],
            cancellationToken);

        if (product is null)
        {
            return null;
        }

        ApplyRequest(product, request);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products.FindAsync(
            [id],
            cancellationToken);

        if (product is null)
        {
            return false;
        }

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static void ApplyRequest(
        Product product,
        ProductRequest request)
    {
        product.ProductCode = request.ProductCode.Trim();
        product.ProductName = request.ProductName.Trim();
        product.BrandId = request.BrandId;

        product.Price = request.Price;
        product.PriceSourceUrl = NormalizeOptional(request.PriceSourceUrl);
        product.PriceCheckedAt = request.PriceCheckedAt;
        product.SpecSourceUrl = request.SpecSourceUrl.Trim();

        product.Description = NormalizeOptional(request.Description);
        product.Image = NormalizeOptional(request.Image);

        // Sản phẩm mới hoặc vừa sửa cần được duyệt lại trước khi tư vấn.
        product.IsActive = false;
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private IQueryable<ProductResponse> QueryResponses()
    {
        return _dbContext.Products
            .AsNoTracking()
            .Select(product => new ProductResponse
            {
                ProductId = product.ProductId,
                ProductCode = product.ProductCode,
                ProductName = product.ProductName,

                CategoryId = product.CategoryId,
                CategoryName = product.Category.CategoryName,

                BrandId = product.BrandId,
                BrandName = product.Brand.BrandName,

                Price = product.Price,
                PriceSourceUrl = product.PriceSourceUrl,
                PriceCheckedAt = product.PriceCheckedAt,
                SpecSourceUrl = product.SpecSourceUrl,
                Description = product.Description,
                Image = product.Image,
                IsActive = product.IsActive
            });
    }
}