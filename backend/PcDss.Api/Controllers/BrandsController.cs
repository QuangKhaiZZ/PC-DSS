using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using PcDss.Api.DTOs.Brands;
using PcDss.Api.Services.Interfaces;

namespace PcDss.Api.Controllers;

[ApiController]
[Route("api/brands")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BrandResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var brands = await _brandService.GetAllAsync(cancellationToken);
        return Ok(brands);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BrandResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var brand = await _brandService.GetByIdAsync(
            id,
            cancellationToken);

        if (brand is null)
        {
            return NotFound(new { message = "Không tìm thấy thương hiệu." });
        }

        return Ok(brand);
    }

    [HttpPost]
    public async Task<ActionResult<BrandResponse>> Create(
        BrandRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryNormalizeName(request))
        {
            return ValidationProblem(ModelState);
        }

        if (await _brandService.NameExistsAsync(
            request.BrandName,
            cancellationToken: cancellationToken))
        {
            return Conflict(new { message = "Tên thương hiệu đã tồn tại." });
        }

        try
        {
            var createdBrand = await _brandService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdBrand.BrandId },
                createdBrand);
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1062 })
        {
            return Conflict(new { message = "Tên thương hiệu đã tồn tại." });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<BrandResponse>> Update(
        int id,
        BrandRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryNormalizeName(request))
        {
            return ValidationProblem(ModelState);
        }

        if (await _brandService.GetByIdAsync(id, cancellationToken) is null)
        {
            return NotFound(new { message = "Không tìm thấy thương hiệu." });
        }

        if (await _brandService.NameExistsAsync(
            request.BrandName,
            id,
            cancellationToken))
        {
            return Conflict(new { message = "Tên thương hiệu đã tồn tại." });
        }

        try
        {
            var updatedBrand = await _brandService.UpdateAsync(
                id,
                request,
                cancellationToken);

            if (updatedBrand is null)
            {
                return NotFound(new { message = "Không tìm thấy thương hiệu." });
            }

            return Ok(updatedBrand);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new
            {
                message = "Dữ liệu vừa thay đổi. Hãy tải lại rồi thử lại."
            });
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1062 })
        {
            return Conflict(new { message = "Tên thương hiệu đã tồn tại." });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await _brandService.DeleteAsync(
                id,
                cancellationToken);

            if (!deleted)
            {
                return NotFound(new { message = "Không tìm thấy thương hiệu." });
            }

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new
            {
                message = "Dữ liệu vừa thay đổi. Hãy tải lại rồi thử lại."
            });
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException { Number: 1451 })
        {
            return Conflict(new
            {
                message = "Không thể xóa thương hiệu đang có sản phẩm sử dụng."
            });
        }
    }

    private bool TryNormalizeName(BrandRequest request)
    {
        request.BrandName = request.BrandName.Trim();

        if (!string.IsNullOrWhiteSpace(request.BrandName))
        {
            return true;
        }

        ModelState.AddModelError(
            nameof(request.BrandName),
            "Tên thương hiệu không được để trống.");
        return false;
    }
}
