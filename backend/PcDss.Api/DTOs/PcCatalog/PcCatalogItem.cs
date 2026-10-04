namespace PcDss.Api.DTOs.PcCatalog;

public sealed record PcCatalogItem(
    string PcId, string ProductName, string Store, decimal PriceVnd,
    string CpuModel, string GpuModel, int RamCapacityGb, int SsdCapacityGb,
    string SourceUrl, DateOnly CheckedAt);
