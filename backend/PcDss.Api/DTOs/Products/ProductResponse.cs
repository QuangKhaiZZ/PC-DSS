namespace PcDss.Api.DTOs.Products;

public class ProductResponse
{
    public int ProductId { get; set; }

    public string ProductCode { get; set; } = string.Empty;

    public string ProductName { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public int BrandId { get; set; }

    public string BrandName { get; set; } = string.Empty;

    public decimal? Price { get; set; }

    public string? PriceSourceUrl { get; set; }

    public DateOnly? PriceCheckedAt { get; set; }

    public string SpecSourceUrl { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Image { get; set; }

    public bool IsActive { get; set; }
}