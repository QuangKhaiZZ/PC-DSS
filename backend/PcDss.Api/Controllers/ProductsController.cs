using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using PcDss.Api.DTOs.Products;
using PcDss.Api.Services.Interfaces;

namespace PcDss.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ICategoryService _categoryService;
    private readonly IBrandService _brandService;

    public ProductsController(
        IProductService productService,
        ICategoryService categoryService,
        IBrandService brandService)
    {
        _productService = productService;
        _categoryService = categoryService;
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var products = await _productService.GetAllAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(
            id,
            cancellationToken);

        if (product is null)
        {
            return NotFound(new { message = "Không tìm thấy sản phẩm." });
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create(
        ProductRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = await ValidateReferencesAsync(
            request,
            null,
            cancellationToken);

        if (validationError is not null)
        {
            return validationError;
        }

        try
        {
            var product = await _productService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = product.ProductId },
                product);
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException
                { Number: 1062 or 1452 })
        {
            return WriteConflict(ex);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> Update(
        int id,
        ProductRequest request,
        CancellationToken cancellationToken)
    {
        var existing = await _productService.GetByIdAsync(
            id,
            cancellationToken);

        if (existing is null)
        {
            return NotFound(new { message = "Không tìm thấy sản phẩm." });
        }

        if (request.CategoryId != existing.CategoryId)
        {
            return Conflict(new
            {
                message = "Chưa hỗ trợ đổi danh mục của sản phẩm đã tạo."
            });
        }

        var validationError = await ValidateReferencesAsync(
            request,
            id,
            cancellationToken);

        if (validationError is not null)
        {
            return validationError;
        }

        try
        {
            var product = await _productService.UpdateAsync(
                id,
                request,
                cancellationToken);

            if (product is null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
            }

            return Ok(product);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new
            {
                message = "Dữ liệu vừa thay đổi. Hãy tải lại rồi thử lại."
            });
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is MySqlException
                { Number: 1062 or 1452 })
        {
            return WriteConflict(ex);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await _productService.DeleteAsync(
                id,
                cancellationToken);

            if (!deleted)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm." });
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
                message =
                    "Không thể xóa sản phẩm đang có thông số, benchmark "
                    + "hoặc dữ liệu liên quan."
            });
        }
    }

    private async Task<ActionResult?> ValidateReferencesAsync(
        ProductRequest request,
        int? excludedProductId,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(
            request.CategoryId,
            cancellationToken);

        if (category is null)
        {
            return BadRequest(new { message = "Danh mục không tồn tại." });
        }

        var brand = await _brandService.GetByIdAsync(
            request.BrandId,
            cancellationToken);

        if (brand is null)
        {
            return BadRequest(new { message = "Thương hiệu không tồn tại." });
        }

        var codeExists = await _productService.CodeExistsAsync(
            request.ProductCode,
            excludedProductId,
            cancellationToken);

        if (codeExists)
        {
            return Conflict(new { message = "Mã sản phẩm đã tồn tại." });
        }

        return null;
    }

    private ConflictObjectResult WriteConflict(DbUpdateException exception)
    {
        var mysqlException = (MySqlException)exception.InnerException!;

        var message = mysqlException.Number == 1062
            ? "Mã sản phẩm đã tồn tại."
            : "Danh mục hoặc thương hiệu không còn tồn tại. Hãy tải lại dữ liệu.";

        return Conflict(new { message });
    }
}