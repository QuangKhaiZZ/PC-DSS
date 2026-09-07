using Microsoft.EntityFrameworkCore;
using PcDss.Api.Models;

namespace PcDss.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
}