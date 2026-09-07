using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PcDss.Api.Models;

[Table("Brands")]
[Index(nameof(BrandName), IsUnique = true, Name = "BrandName")]
public class Brand
{
    [Key]
    [Column("BrandID")]
    public int BrandId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("BrandName")]
    public string BrandName { get; set; } = string.Empty;
}
