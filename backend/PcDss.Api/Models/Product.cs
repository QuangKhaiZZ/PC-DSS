using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PcDss.Api.Models;

[Table("Products")]
[Index(nameof(ProductCode), IsUnique = true, Name = "ProductCode")]
public class Product
{
    [Key]
    [Column("ProductID")]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(100)]
    public string ProductCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string ProductName { get; set; } = string.Empty;

    [Column("CategoryID")]
    public int CategoryId { get; set; }

    [Column("BrandID")]
    public int BrandId { get; set; }

    [Column(TypeName = "decimal(15,0)")]
    public decimal? Price { get; set; }

    [MaxLength(1000)]
    public string? PriceSourceUrl { get; set; }

    [Column(TypeName = "date")]
    public DateOnly? PriceCheckedAt { get; set; }

    [Required]
    [MaxLength(1000)]
    public string SpecSourceUrl { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    [MaxLength(1000)]
    public string? Image { get; set; }

    public bool IsActive { get; set; } = false;
    public Category Category { get; set; } = null!;

public Brand Brand { get; set; } = null!;
}