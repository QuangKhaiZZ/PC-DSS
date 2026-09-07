using Microsoft.EntityFrameworkCore;
using PcDss.Api.Data;
using PcDss.Api.DTOs.Brands;
using PcDss.Api.Models;
using PcDss.Api.Services.Interfaces;

namespace PcDss.Api.Services;

public class BrandService : IBrandService
{
    private readonly AppDbContext _dbContext;

    public BrandService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<BrandResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Brands
            .AsNoTracking()
            .OrderBy(brand => brand.BrandName)
            .Select(brand => new BrandResponse
            {
                BrandId = brand.BrandId,
                BrandName = brand.BrandName
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<BrandResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Brands
            .AsNoTracking()
            .Where(brand => brand.BrandId == id)
            .Select(brand => new BrandResponse
            {
                BrandId = brand.BrandId,
                BrandName = brand.BrandName
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public Task<bool> NameExistsAsync(
        string brandName,
        int? excludedBrandId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = brandName.Trim();

        return _dbContext.Brands.AnyAsync(
            brand => brand.BrandName == normalizedName
                && (!excludedBrandId.HasValue
                    || brand.BrandId != excludedBrandId.Value),
            cancellationToken);
    }

    public async Task<BrandResponse> CreateAsync(
        BrandRequest request,
        CancellationToken cancellationToken = default)
    {
        var brand = new Brand
        {
            BrandName = request.BrandName.Trim()
        };

        _dbContext.Brands.Add(brand);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(brand);
    }

    public async Task<BrandResponse?> UpdateAsync(
        int id,
        BrandRequest request,
        CancellationToken cancellationToken = default)
    {
        var brand = await _dbContext.Brands.FindAsync(
            [id],
            cancellationToken);

        if (brand is null)
        {
            return null;
        }

        brand.BrandName = request.BrandName.Trim();
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(brand);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var brand = await _dbContext.Brands.FindAsync(
            [id],
            cancellationToken);

        if (brand is null)
        {
            return false;
        }

        _dbContext.Brands.Remove(brand);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static BrandResponse ToResponse(Brand brand)
    {
        return new BrandResponse
        {
            BrandId = brand.BrandId,
            BrandName = brand.BrandName
        };
    }
}
