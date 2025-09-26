using Ergoplanner.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ergoplanner.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for SymbolCategory entity
/// </summary>
public class SymbolCategoryConfiguration : IEntityTypeConfiguration<SymbolCategory>
{
    public void Configure(EntityTypeBuilder<SymbolCategory> builder)
    {
        // Table configuration
        builder.ToTable("SymbolCategories");

        // Primary key
        builder.HasKey(sc => sc.Id);

        // Indexes
        builder.HasIndex(sc => sc.Code)
            .IsUnique()
            .HasDatabaseName("IX_SymbolCategories_Code");

        builder.HasIndex(sc => sc.ParentCategoryId)
            .HasDatabaseName("IX_SymbolCategories_ParentCategoryId");

        builder.HasIndex(sc => sc.IsActive)
            .HasDatabaseName("IX_SymbolCategories_IsActive");

        builder.HasIndex(sc => sc.Level)
            .HasDatabaseName("IX_SymbolCategories_Level");

        builder.HasIndex(sc => sc.Path)
            .HasDatabaseName("IX_SymbolCategories_Path");

        builder.HasIndex(sc => sc.StandardType)
            .HasDatabaseName("IX_SymbolCategories_StandardType");

        builder.HasIndex(sc => sc.CreatedAt)
            .HasDatabaseName("IX_SymbolCategories_CreatedAt");

        // Composite indexes
        builder.HasIndex(sc => new { sc.ParentCategoryId, sc.DisplayOrder })
            .HasDatabaseName("IX_SymbolCategories_ParentId_DisplayOrder");

        builder.HasIndex(sc => new { sc.IsActive, sc.Level })
            .HasDatabaseName("IX_SymbolCategories_IsActive_Level");

        builder.HasIndex(sc => new { sc.ParentCategoryId, sc.Name })
            .IsUnique()
            .HasDatabaseName("IX_SymbolCategories_ParentId_Name");

        // Basic properties
        builder.Property(sc => sc.Code)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(sc => sc.Name)
            .IsRequired()
            .HasMaxLength(200)
            .IsUnicode(true);

        builder.Property(sc => sc.Description)
            .IsRequired()
            .HasMaxLength(1000)
            .IsUnicode(true);

        builder.Property(sc => sc.IconPath)
            .HasMaxLength(500)
            .IsUnicode(false);

        builder.Property(sc => sc.ColorCode)
            .HasMaxLength(7)
            .IsUnicode(false)
            .HasComment("Hex color code (e.g., #FF0000)");

        builder.Property(sc => sc.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(sc => sc.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(sc => sc.StandardType)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(sc => sc.Path)
            .IsRequired()
            .HasMaxLength(2000)
            .IsUnicode(true)
            .HasComment("Hierarchical path from root (e.g., 'Equipment/Pumps/Centrifugal')");

        builder.Property(sc => sc.Level)
            .IsRequired()
            .HasDefaultValue(0)
            .HasComment("Depth in hierarchy (0 = root, 1 = first level, etc.)");

        // Self-referencing relationship for parent-child hierarchy
        builder.Property(sc => sc.ParentCategoryId)
            .IsRequired(false);

        builder.HasOne(sc => sc.ParentCategory)
            .WithMany(sc => sc.ChildCategories)
            .HasForeignKey(sc => sc.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_SymbolCategories_ParentCategory");

        // One-to-many relationship with Symbols
        builder.HasMany(sc => sc.Symbols)
            .WithOne(s => s.Category)
            .HasForeignKey(s => s.CategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_SymbolCategories_Symbols");

        // Audit fields from BaseEntity
        builder.Property(sc => sc.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(sc => sc.CreatedBy)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(sc => sc.ModifiedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(sc => sc.ModifiedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Soft delete fields
        builder.Property(sc => sc.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(sc => sc.DeletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(sc => sc.DeletedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Optimistic concurrency
        builder.Property(sc => sc.RowVersion)
            .IsRowVersion()
            .HasColumnName("xmin")
            .HasColumnType("xid");

        // Query filter for soft delete
        builder.HasQueryFilter(sc => !sc.IsDeleted);

        // Check constraints removed due to obsolete API in EF Core 9
        // These will be added via migration scripts if needed

        // Configure navigational properties to be loaded
        builder.Navigation(sc => sc.ChildCategories)
            .EnableLazyLoading(false);

        builder.Navigation(sc => sc.Symbols)
            .EnableLazyLoading(false);

        builder.Navigation(sc => sc.ParentCategory)
            .EnableLazyLoading(false);
    }
}