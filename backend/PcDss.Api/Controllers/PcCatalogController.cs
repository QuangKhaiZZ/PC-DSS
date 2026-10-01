using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using PcDss.Api.Services;

namespace PcDss.Api.Controllers;

[ApiController]
[Route("api/pc-catalog")]
public sealed class PcCatalogController(CatalogService catalog, PredictionService predictor) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(catalog.Items);

    [HttpGet("{pcId}")]
    public IActionResult GetById(string pcId) => catalog.Find(pcId) is { } pc
        ? Ok(pc) : NotFound(new { message = "Không tìm thấy bộ PC." });

    [HttpGet("{pcId}/prediction")]
    public IActionResult Predict(string pcId,
        [FromQuery, Required, RegularExpression("^(Gaming|Rendering)$")] string purpose)
    {
        var pc = catalog.Find(pcId);
        if (pc is null) return NotFound(new { message = "Không tìm thấy bộ PC." });
        try { return Ok(predictor.Predict(pc, purpose)); }
        catch (PredictionInputException ex)
        {
            return UnprocessableEntity(new { message = ex.Message });
        }
    }
}
