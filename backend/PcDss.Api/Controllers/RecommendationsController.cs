using Microsoft.AspNetCore.Mvc;
using PcDss.Api.DTOs.Recommendations;
using PcDss.Api.Services;

namespace PcDss.Api.Controllers;

[ApiController]
[Route("api/recommendations")]
public sealed class RecommendationsController(RecommendationService service) : ControllerBase
{
    [HttpPost]
    public ActionResult<RecommendationResponse> Recommend(RecommendationRequest request) =>
        Ok(service.Recommend(request));
}
