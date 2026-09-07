using System.ComponentModel.DataAnnotations;

namespace PcDss.Api.DTOs.Products;

public class ProductRequest : IValidatableObject
{
    [Required(ErrorMessage = "Mã sản phẩm không được để trống.")]
    [MaxLength(100)]
    public string ProductCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên sản phẩm không được để trống.")]
    [MaxLength(255)]
    public string ProductName { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Danh mục không hợp lệ.")]
    public int CategoryId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Thương hiệu không hợp lệ.")]
    public int BrandId { get; set; }

    [Range(typeof(decimal), "1", "999999999999999",
        ErrorMessage = "Giá phải lớn hơn 0 và không vượt quá 15 chữ số.")]
    public decimal? Price { get; set; }

    [Url(ErrorMessage = "Đường dẫn nguồn giá không hợp lệ.")]
    [MaxLength(1000)]
    public string? PriceSourceUrl { get; set; }

    public DateOnly? PriceCheckedAt { get; set; }

    [Required(ErrorMessage = "Nguồn thông số không được để trống.")]
    [Url(ErrorMessage = "Đường dẫn nguồn thông số không hợp lệ.")]
    [MaxLength(1000)]
    public string SpecSourceUrl { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Url(ErrorMessage = "Đường dẫn ảnh không hợp lệ.")]
    [MaxLength(1000)]
    public string? Image { get; set; }

    public IEnumerable<ValidationResult> Validate(
    ValidationContext validationContext)
{
    if (Price.HasValue && Price.Value != decimal.Truncate(Price.Value))
    {
        yield return new ValidationResult(
            "Giá VNĐ phải là số nguyên.",
            new[] { nameof(Price) });
    }

    if (Price.HasValue)
    {
        if (string.IsNullOrWhiteSpace(PriceSourceUrl)
            || !PriceCheckedAt.HasValue)
        {
            yield return new ValidationResult(
                "Khi có giá, phải có nguồn giá và ngày ghi nhận.",
                new[] { nameof(PriceSourceUrl), nameof(PriceCheckedAt) });
        }
    }
    else if (!string.IsNullOrWhiteSpace(PriceSourceUrl)
        || PriceCheckedAt.HasValue)
    {
        yield return new ValidationResult(
            "Khi chưa có giá, nguồn giá và ngày ghi nhận phải để trống.",
            new[] { nameof(Price), nameof(PriceSourceUrl), nameof(PriceCheckedAt) });
    }

    if (Description is not null
        && System.Text.Encoding.UTF8.GetByteCount(Description) > 65535)
    {
        yield return new ValidationResult(
            "Mô tả vượt quá dung lượng cho phép của cột TEXT.",
            new[] { nameof(Description) });
    }
}

}
