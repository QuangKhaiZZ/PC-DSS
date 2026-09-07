using PcDss.Api.DTOs.Products;

namespace PcDss.Api.Services.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ProductResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<bool> CodeExistsAsync(
        string productCode,
        int? excludedProductId = null,
        CancellationToken cancellationToken = default);

    Task<ProductResponse> CreateAsync(
        ProductRequest request,
        CancellationToken cancellationToken = default);

    Task<ProductResponse?> UpdateAsync(
        int id,
        ProductRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}