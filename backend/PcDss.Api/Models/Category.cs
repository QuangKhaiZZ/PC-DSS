using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PcDss.Api.Models;

[Table("Categories")]
[Index(nameof(CategoryName), IsUnique = true)]
public class Category
{
    [Key]
    [Column("CategoryID")]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("CategoryName")]
    public string CategoryName { get; set; } = string.Empty;
}