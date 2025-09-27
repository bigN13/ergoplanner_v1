using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace Ergoplanner.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for Layer entity with hierarchical support and optimized indexing
/// </summary>
public class LayerConfiguration : IEntityTypeConfiguration<Layer>
{
    public void Configure(EntityTypeBuilder<Layer> builder)
    {
        // Table configuration
        builder.ToTable("Layers");

        // Primary key
        builder.HasKey(l => l.Id);

        // Unique constraints
        builder.HasIndex(l => new { l.DrawingId, l.Code })
            .IsUnique()
            .HasDatabaseName("IX_Layers_DrawingId_Code");

        // Hierarchical indexes for efficient tree queries
        builder.HasIndex(l => l.HierarchyPath)
            .HasDatabaseName("IX_Layers_HierarchyPath")
            .HasMethod("gin")  // PostgreSQL GIN index for efficient text search
            .HasOperators("gin_trgm_ops"); // Trigram operators for path matching

        builder.HasIndex(l => l.ParentLayerId)
            .HasDatabaseName("IX_Layers_ParentLayerId");

        builder.HasIndex(l => new { l.DrawingId, l.ParentLayerId })
            .HasDatabaseName("IX_Layers_DrawingId_ParentLayerId");

        builder.HasIndex(l => new { l.DrawingId, l.HierarchyLevel })
            .HasDatabaseName("IX_Layers_DrawingId_HierarchyLevel");

        // Performance indexes for common queries
        builder.HasIndex(l => new { l.DrawingId, l.IsVisible, l.DisplayOrder })
            .HasDatabaseName("IX_Layers_DrawingId_IsVisible_DisplayOrder");

        builder.HasIndex(l => new { l.DrawingId, l.Type, l.IsVisible })
            .HasDatabaseName("IX_Layers_DrawingId_Type_IsVisible");

        builder.HasIndex(l => l.CreatedAt)
            .HasDatabaseName("IX_Layers_CreatedAt");

        builder.HasIndex(l => l.ModifiedAt)
            .HasDatabaseName("IX_Layers_ModifiedAt");

        // Search and filtering indexes
        builder.HasIndex(l => new { l.DrawingId, l.IsDeleted })
            .HasDatabaseName("IX_Layers_DrawingId_IsDeleted");

        // Basic properties
        builder.Property(l => l.Code)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(200)
            .IsUnicode(true);

        builder.Property(l => l.Description)
            .IsRequired()
            .HasMaxLength(1000)
            .IsUnicode(true);

        builder.Property(l => l.Color)
            .IsRequired()
            .HasMaxLength(7)  // #RRGGBB format
            .IsUnicode(false)
            .HasDefaultValue("#000000");

        builder.Property(l => l.Opacity)
            .IsRequired()
            .HasColumnType("double precision")
            .HasDefaultValue(1.0);

        builder.Property(l => l.IsVisible)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(l => l.IsSelectable)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(l => l.IsLocked)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(l => l.IsPrintable)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(l => l.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(l => l.Type)
            .IsRequired()
            .HasConversion<int>()
            .HasDefaultValue(LayerType.Standard);

        // Hierarchy properties
        builder.Property(l => l.HierarchyPath)
            .IsRequired()
            .HasMaxLength(1000)
            .IsUnicode(false);

        builder.Property(l => l.HierarchyLevel)
            .IsRequired()
            .HasDefaultValue(0);

        // Foreign key relationships
        builder.Property(l => l.DrawingId)
            .IsRequired();

        builder.HasOne(l => l.Drawing)
            .WithMany(d => d.Layers)
            .HasForeignKey(l => l.DrawingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(l => l.ParentLayerId)
            .IsRequired(false);

        // Self-referencing relationship for hierarchy
        builder.HasOne(l => l.ParentLayer)
            .WithMany(l => l.ChildLayers)
            .HasForeignKey(l => l.ParentLayerId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascading deletes in hierarchy

        // Value objects configuration
        ConfigureLayerProperties(builder);
        ConfigureLayerMetadata(builder);

        // Collection navigation properties
        builder.HasMany(l => l.ChildLayers)
            .WithOne(l => l.ParentLayer)
            .HasForeignKey(l => l.ParentLayerId);

        builder.HasMany(l => l.LayerElements)
            .WithOne(le => le.Layer)
            .HasForeignKey(le => le.LayerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Audit fields from BaseEntity
        builder.Property(l => l.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(l => l.CreatedBy)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(l => l.ModifiedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(l => l.ModifiedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Soft delete fields
        builder.Property(l => l.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(l => l.DeletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(l => l.DeletedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Optimistic concurrency
        builder.Property(l => l.RowVersion)
            .IsRowVersion()
            .HasColumnName("xmin")
            .HasColumnType("xid");

        // Query filter for soft delete
        builder.HasQueryFilter(l => !l.IsDeleted);

        // Check constraints for data integrity - using new ToTable syntax
        builder.ToTable("Layers", t =>
        {
            t.HasCheckConstraint(
                "CK_Layers_Opacity_Range",
                "\"Opacity\" >= 0.0 AND \"Opacity\" <= 1.0");

            t.HasCheckConstraint(
                "CK_Layers_HierarchyLevel_NonNegative",
                "\"HierarchyLevel\" >= 0");

            t.HasCheckConstraint(
                "CK_Layers_Color_Format",
                "\"Color\" ~ '^#[0-9A-Fa-f]{6}$'");
        });
    }

    private static void ConfigureLayerProperties(EntityTypeBuilder<Layer> builder)
    {
        builder.Property(l => l.Properties)
            .HasColumnName("Properties")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                }),
                v => JsonSerializer.Deserialize<LayerProperties>(v, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }) ?? LayerProperties.Default(),
                new ValueComparer<LayerProperties>(
                    (c1, c2) => c1!.Equals(c2),
                    c => c.GetHashCode(),
                    c => c)); // LayerProperties is immutable, no need to clone
    }

    private static void ConfigureLayerMetadata(EntityTypeBuilder<Layer> builder)
    {
        builder.Property(l => l.Metadata)
            .HasColumnName("Metadata")
            .HasColumnType("jsonb")
            .HasConversion(
                v => v.ToJson(),
                v => LayerMetadata.FromJson(v),
                new ValueComparer<LayerMetadata>(
                    (c1, c2) => c1!.Equals(c2),
                    c => c.GetHashCode(),
                    c => c.Clone()));

        // Create GIN index on metadata for efficient JSON queries
        builder.HasIndex(l => l.Metadata)
            .HasDatabaseName("IX_Layers_Metadata_Gin")
            .HasMethod("gin");
    }
}