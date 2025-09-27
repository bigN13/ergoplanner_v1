using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace Ergoplanner.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for LayerElement junction entity
/// </summary>
public class LayerElementConfiguration : IEntityTypeConfiguration<LayerElement>
{
    public void Configure(EntityTypeBuilder<LayerElement> builder)
    {
        // Table configuration
        builder.ToTable("LayerElements");

        // Primary key
        builder.HasKey(le => le.Id);

        // Unique constraint to prevent duplicate element assignments within a layer
        builder.HasIndex(le => new { le.LayerId, le.ElementId })
            .IsUnique()
            .HasDatabaseName("IX_LayerElements_LayerId_ElementId");

        // Performance indexes for common queries
        builder.HasIndex(le => le.LayerId)
            .HasDatabaseName("IX_LayerElements_LayerId");

        builder.HasIndex(le => le.ElementId)
            .HasDatabaseName("IX_LayerElements_ElementId");

        builder.HasIndex(le => le.ElementType)
            .HasDatabaseName("IX_LayerElements_ElementType");

        builder.HasIndex(le => new { le.LayerId, le.ElementType })
            .HasDatabaseName("IX_LayerElements_LayerId_ElementType");

        builder.HasIndex(le => new { le.LayerId, le.IsVisible, le.DisplayOrder })
            .HasDatabaseName("IX_LayerElements_LayerId_IsVisible_DisplayOrder");

        builder.HasIndex(le => new { le.ElementId, le.ElementType })
            .HasDatabaseName("IX_LayerElements_ElementId_ElementType");

        // Audit and cleanup indexes
        builder.HasIndex(le => le.CreatedAt)
            .HasDatabaseName("IX_LayerElements_CreatedAt");

        builder.HasIndex(le => le.ModifiedAt)
            .HasDatabaseName("IX_LayerElements_ModifiedAt");

        builder.HasIndex(le => le.IsDeleted)
            .HasDatabaseName("IX_LayerElements_IsDeleted");

        // Properties configuration
        builder.Property(le => le.LayerId)
            .IsRequired();

        builder.Property(le => le.ElementId)
            .IsRequired();

        builder.Property(le => le.ElementType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(le => le.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(le => le.IsVisible)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(le => le.IsLocked)
            .IsRequired()
            .HasDefaultValue(false);

        // JSON metadata storage
        builder.Property(le => le.ElementMetadata)
            .HasColumnName("ElementMetadata")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                }),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }) ?? new Dictionary<string, object>());

        // Create GIN index on metadata for efficient JSON queries
        builder.HasIndex(le => le.ElementMetadata)
            .HasDatabaseName("IX_LayerElements_ElementMetadata_Gin")
            .HasMethod("gin");

        // Foreign key relationships
        builder.HasOne(le => le.Layer)
            .WithMany(l => l.LayerElements)
            .HasForeignKey(le => le.LayerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Note: We don't create foreign keys to actual elements (nodes/edges) as they are in different tables
        // The ElementId is a logical reference that will be enforced at the application level

        // Audit fields from BaseEntity
        builder.Property(le => le.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(le => le.CreatedBy)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(le => le.ModifiedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(le => le.ModifiedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Soft delete fields
        builder.Property(le => le.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(le => le.DeletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(le => le.DeletedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Optimistic concurrency
        builder.Property(le => le.RowVersion)
            .IsRowVersion()
            .HasColumnName("xmin")
            .HasColumnType("xid");

        // Query filter for soft delete
        builder.HasQueryFilter(le => !le.IsDeleted);

        // Check constraints for data integrity - using new ToTable syntax
        builder.ToTable("LayerElements", t =>
        {
            t.HasCheckConstraint(
                "CK_LayerElements_DisplayOrder_NonNegative",
                "\"DisplayOrder\" >= 0");
        });
    }
}