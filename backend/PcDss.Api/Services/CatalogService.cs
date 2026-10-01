using PcDss.Api.Data;
using PcDss.Api.DTOs.PcCatalog;

namespace PcDss.Api.Services;

public sealed class CatalogService
{
    public IReadOnlyList<PcCatalogItem> Items { get; }

    public CatalogService(string dataDirectory)
    {
        string[] columns = ["PcId", "ProductName", "Store", "PriceVnd", "CpuModel", "GpuModel",
            "RamCapacityGb", "SsdCapacityGb", "Availability", "SourceUrl", "CheckedAt"];
        var items = CsvTable.Read(Path.Combine(dataDirectory, "pc_catalog.csv"), columns).Select(row =>
        {
            var availability = CsvTable.Required(row, "Availability");
            if (availability is not ("IN_STOCK" or "OUT_OF_STOCK" or "UNKNOWN"))
                throw new InvalidDataException("Trạng thái tồn kho không hợp lệ");
            return new PcCatalogItem(CsvTable.Required(row, "PcId"), CsvTable.Required(row, "ProductName"),
                CsvTable.Required(row, "Store"), CsvTable.PositiveInteger(row, "PriceVnd"),
                CsvTable.Required(row, "CpuModel"), CsvTable.Required(row, "GpuModel"),
                checked((int)CsvTable.PositiveInteger(row, "RamCapacityGb")),
                checked((int)CsvTable.PositiveInteger(row, "SsdCapacityGb")), availability,
                CsvTable.Url(row, "SourceUrl"), CsvTable.Date(row, "CheckedAt"));
        }).OrderBy(x => x.PriceVnd).ThenBy(x => x.PcId, StringComparer.Ordinal).ToArray();
        if (items.Select(x => x.PcId).Distinct(StringComparer.OrdinalIgnoreCase).Count() != items.Length)
            throw new InvalidDataException("Trùng PcId trong pc_catalog.csv");
        Items = Array.AsReadOnly(items);
    }

    public PcCatalogItem? Find(string pcId) => Items.FirstOrDefault(x =>
        x.PcId.Equals(pcId, StringComparison.OrdinalIgnoreCase));
}
