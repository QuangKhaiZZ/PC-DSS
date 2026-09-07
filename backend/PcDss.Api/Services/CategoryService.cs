using Microsoft.EntityFrameworkCore;
using PcDss.Api.Data;
using PcDss.Api.DTOs.Categories;
using PcDss.Api.Models;
using PcDss.Api.Services.Interfaces;

namespace PcDss.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _dbContext;

    public CategoryService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.CategoryName)
            .Select(category => new CategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .Where(category => category.CategoryId == id)
            .Select(category => new CategoryResponse
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public Task<bool> NameExistsAsync(
        string categoryName,
        int? excludedCategoryId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = categoryName.Trim();

        return _dbContext.Categories.AnyAsync(
            category => category.CategoryName == normalizedName
                && (!excludedCategoryId.HasValue
                    || category.CategoryId != excludedCategoryId.Value),
            cancellationToken);
    }

    public async Task<CategoryResponse> CreateAsync(
        CategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var category = new Category
        {
            CategoryName = request.CategoryName.Trim()
        };

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(category);
    }

    public async Task<CategoryResponse?> UpdateAsync(
        int id,
        CategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories.FindAsync(
            [id],
            cancellationToken);

        if (category is null)
        {
            return null;
        }

        category.CategoryName = request.CategoryName.Trim();
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(category);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var category = await _dbContext.Categories.FindAsync(
            [id],
            cancellationToken);

        if (category is null)
        {
            return false;
        }

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CategoryResponse ToResponse(Category category)
    {
        return new CategoryResponse
        {
            CategoryId = category.CategoryId,
            CategoryName = category.CategoryName
        };
    }
}
