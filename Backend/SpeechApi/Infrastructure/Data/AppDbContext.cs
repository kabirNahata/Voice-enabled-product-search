using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Transcript> Transcripts => Set<Transcript>();
    public DbSet<Product> Products => Set<Product>();        // ← add this

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Session>(e =>
        {
            e.ToTable("Sessions");
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired().HasMaxLength(200);
            e.Property(s => s.CreatedAt).IsRequired();
            e.HasMany(s => s.Transcripts)
             .WithOne(t => t.Session)
             .HasForeignKey(t => t.SessionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transcript>(e =>
        {
            e.ToTable("Transcripts");
            e.HasKey(t => t.Id);
            e.Property(t => t.Text).IsRequired();
            e.Property(t => t.Type).IsRequired().HasMaxLength(10);
            e.Property(t => t.Language).HasMaxLength(10);
            e.Property(t => t.CreatedAt).IsRequired();
        });

        // ── Product ───────────────────────────────────────────────────────
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).IsRequired().HasMaxLength(200);
            e.Property(p => p.Description).IsRequired();
            e.Property(p => p.Price).IsRequired().HasColumnType("decimal(18,2)");
            e.Property(p => p.Category).IsRequired().HasMaxLength(100);
            e.Property(p => p.Brand).IsRequired().HasMaxLength(100);
            e.Property(p => p.SKU).IsRequired().HasMaxLength(50);
            e.HasIndex(p => p.SKU).IsUnique();
            e.Property(p => p.Stock).IsRequired();
            e.Property(p => p.ImageUrl).HasMaxLength(500);
            e.Property(p => p.Rating);
            e.Property(p => p.IsActive).IsRequired();
            e.Property(p => p.CreatedAt).IsRequired();
        });
    }
}