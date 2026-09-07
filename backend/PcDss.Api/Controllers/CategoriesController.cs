using Microsoft.AspNetCore.Mvc;
using PcDss.Api.DTOs.Categories;
using PcDss.Api.Services.Interfaces;

namespace PcDss.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetAllAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(
            id,
            cancellationToken);

        if (category is null)
        {
            return NotFound(new { message = "Không tìm thấy danh mục." });
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(
        CategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryNormalizeName(request))
        {
            return ValidationProblem(ModelState);
        }

        if (await _categoryService.NameExistsAsync(
            request.CategoryName,
            cancellationToken: cancellationToken))
        {
            return Conflict(new { message = "Tên danh mục đã tồn tại." });
        }

        var createdCategory = await _categoryService.CreateAsync(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdCategory.CategoryId },
            createdCategory);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> Update(
        int id,
        CategoryRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryNormalizeName(request))
        {
            return ValidationProblem(ModelState);
        }

        if (await _categoryService.GetByIdAsync(id, cancellationToken) is null)
        {
            return NotFound(new { message = "Không tìm thấy danh mục." });
        }

        if (await _categoryService.NameExistsAsync(
            request.CategoryName,
            id,
            cancellationToken))
        {
            return Conflict(new { message = "Tên danh mục đã tồn tại." });
        }

        var updatedCategory = await _categoryService.UpdateAsync(
            id,
            request,
            cancellationToken);

        if (updatedCategory is null)
        {
            return NotFound(new { message = "Không tìm thấy danh mục." });
        }

        return Ok(updatedCategory);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await _categoryService.DeleteAsync(
            id,
            cancellationToken);

        if (!deleted)
        {
            return NotFound(new { message = "Không tìm thấy danh mục." });
        }

        return NoContent();
    }

    private bool TryNormalizeName(CategoryRequest request)
    {
        request.CategoryName = request.CategoryName.Trim();

        if (!string.IsNullOrWhiteSpace(request.CategoryName))
        {
            return true;
        }

        ModelState.AddModelError(
            nameof(request.CategoryName),
            "Tên danh mục không được để trống.");
        return false;
    }
}
