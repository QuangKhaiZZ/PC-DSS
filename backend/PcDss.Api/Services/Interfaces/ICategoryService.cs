using PcDss.Api.DTOs.Categories;

namespace PcDss.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<CategoryResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(
        string categoryName,
        int? excludedCategoryId = null,
        CancellationToken cancellationToken = default);

    Task<CategoryResponse> CreateAsync(
        CategoryRequest request,
        CancellationToken cancellationToken = default);

    Task<CategoryResponse?> UpdateAsync(
        int id,
        CategoryRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
