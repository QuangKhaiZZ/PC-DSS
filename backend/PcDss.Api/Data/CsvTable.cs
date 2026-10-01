using System.Globalization;
using Microsoft.VisualBasic.FileIO;

namespace PcDss.Api.Data;

// Supports quoted commas, escaped quotes, multiline cells and UTF-8 BOM.
internal static class CsvTable
{
    public static IReadOnlyList<Dictionary<string, string>> Read(string path, string[] required)
    {
        using var parser = new TextFieldParser(path, System.Text.Encoding.UTF8, true);
        parser.TextFieldType = FieldType.Delimited;
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;
        parser.TrimWhiteSpace = true;
        var header = parser.ReadFields() ?? throw new InvalidDataException($"CSV rỗng: {path}");
        header = header.Select(x => x.Trim().TrimStart('\uFEFF')).ToArray();
        if (header.Distinct(StringComparer.Ordinal).Count() != header.Length || required.Except(header).Any())
            throw new InvalidDataException($"CSV thiếu cột hoặc trùng tên cột: {path}");
        var result = new List<Dictionary<string, string>>();
        while (!parser.EndOfData)
        {
            var fields = parser.ReadFields()!;
            if (fields.Length != header.Length)
                throw new InvalidDataException($"CSV sai số cột: {path}, dòng {parser.LineNumber}");
            result.Add(header.Zip(fields).ToDictionary(x => x.First, x => x.Second.Trim()));
        }
        return result;
    }

    public static string Required(Dictionary<string, string> row, string key) =>
        string.IsNullOrWhiteSpace(row[key])
            ? throw new InvalidDataException($"Thiếu giá trị {key}") : row[key];

    public static decimal PositiveInteger(Dictionary<string, string> row, string key)
    {
        if (!decimal.TryParse(Required(row, key), NumberStyles.AllowDecimalPoint,
                CultureInfo.InvariantCulture, out var value) || value <= 0 || value != decimal.Truncate(value))
            throw new InvalidDataException($"{key} phải là số nguyên dương");
        return value;
    }

    public static DateOnly Date(Dictionary<string, string> row, string key) =>
        DateOnly.TryParseExact(Required(row, key), "yyyy-MM-dd", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var date) ? date : throw new InvalidDataException($"Sai ngày {key}");

    public static string Url(Dictionary<string, string> row, string key)
    {
        var value = Required(row, key);
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))
            throw new InvalidDataException($"Sai URL {key}");
        return value;
    }
}
