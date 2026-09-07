using PcDss.Api.DTOs.Brands;

namespace PcDss.Api.Services.Interfaces;

public interface IBrandService
{
    Task<IReadOnlyList<BrandResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<BrandResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(
        string brandName,
        int? excludedBrandId = null,
        CancellationToken cancellationToken = default);

    Task<BrandResponse> CreateAsync(
        BrandRequest request,
        CancellationToken cancellationToken = default);

    Task<BrandResponse?> UpdateAsync(
        int id,
        BrandRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
