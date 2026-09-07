using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PcDss.Api.DTOs.Brands;

public class BrandRequest
{
    [JsonPropertyName("name")]
    [Required(ErrorMessage = "Tên thương hiệu không được để trống.")]
    [MaxLength(100, ErrorMessage = "Tên thương hiệu không được vượt quá 100 ký tự.")]
    public string BrandName { get; set; } = string.Empty;
}
