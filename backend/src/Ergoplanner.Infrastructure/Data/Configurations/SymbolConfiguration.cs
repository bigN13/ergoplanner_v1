using Ergoplanner.Domain.Entities;
using Ergoplanner.Domain.Enums;
using Ergoplanner.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace Ergoplanner.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for Symbol entity
/// </summary>
public class SymbolConfiguration : IEntityTypeConfiguration<Symbol>
{
    public void Configure(EntityTypeBuilder<Symbol> builder)
    {
        // Table configuration
        builder.ToTable("Symbols");

        // Primary key
        builder.HasKey(s => s.Id);

        // Indexes
        builder.HasIndex(s => s.Code)
            .IsUnique()
            .HasDatabaseName("IX_Symbols_Code");

        builder.HasIndex(s => s.CategoryId)
            .HasDatabaseName("IX_Symbols_CategoryId");

        builder.HasIndex(s => s.IsActive)
            .HasDatabaseName("IX_Symbols_IsActive");

        builder.HasIndex(s => s.CreatedAt)
            .HasDatabaseName("IX_Symbols_CreatedAt");

        builder.HasIndex(s => s.ModifiedAt)
            .HasDatabaseName("IX_Symbols_ModifiedAt");

        // Composite index for category and active status
        builder.HasIndex(s => new { s.CategoryId, s.IsActive })
            .HasDatabaseName("IX_Symbols_CategoryId_IsActive");

        // Composite index for searching
        builder.HasIndex(s => new { s.IsActive, s.CreatedAt })
            .HasDatabaseName("IX_Symbols_IsActive_CreatedAt");

        // Basic properties
        builder.Property(s => s.Code)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200)
            .IsUnicode(true);

        builder.Property(s => s.Description)
            .IsRequired()
            .HasMaxLength(1000)
            .IsUnicode(true);

        builder.Property(s => s.SvgContent)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(s => s.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(s => s.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(s => s.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(s => s.MinZoomLevel)
            .IsRequired()
            .HasDefaultValue(0.1)
            .HasColumnType("double precision");

        builder.Property(s => s.MaxDetailZoom)
            .IsRequired()
            .HasDefaultValue(2.0)
            .HasColumnType("double precision");

        // Foreign key to SymbolCategory
        builder.Property(s => s.CategoryId)
            .IsRequired();

        builder.HasOne(s => s.Category)
            .WithMany(c => c.Symbols)
            .HasForeignKey(s => s.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Value objects configuration
        ConfigureDimensions(builder);
        ConfigureStandardCompliance(builder);
        ConfigureConnectionPoints(builder);

        // JSON columns for flexible data
        builder.Property(s => s.Metadata)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions)null!) ?? new Dictionary<string, object>());

        builder.Property(s => s.Tags)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());

        // Audit fields from BaseEntity
        builder.Property(s => s.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(s => s.CreatedBy)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(s => s.ModifiedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(s => s.ModifiedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Soft delete fields
        builder.Property(s => s.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.DeletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(s => s.DeletedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Optimistic concurrency
        builder.Property(s => s.RowVersion)
            .IsRowVersion()
            .HasColumnName("xmin")
            .HasColumnType("xid");

        // Query filter for soft delete
        builder.HasQueryFilter(s => !s.IsDeleted);
    }

    private static void ConfigureDimensions(EntityTypeBuilder<Symbol> builder)
    {
        builder.ComplexProperty(s => s.Dimensions, dimensionsBuilder =>
        {
            dimensionsBuilder.Property(d => d.Width)
                .IsRequired()
                .HasColumnName("Dimensions_Width")
                .HasColumnType("double precision");

            dimensionsBuilder.Property(d => d.Height)
                .IsRequired()
                .HasColumnName("Dimensions_Height")
                .HasColumnType("double precision");

            dimensionsBuilder.Property(d => d.OriginX)
                .IsRequired()
                .HasColumnName("Dimensions_OriginX")
                .HasColumnType("double precision")
                .HasDefaultValue(0.0);

            dimensionsBuilder.Property(d => d.OriginY)
                .IsRequired()
                .HasColumnName("Dimensions_OriginY")
                .HasColumnType("double precision")
                .HasDefaultValue(0.0);

            dimensionsBuilder.Property(d => d.BoundingMinX)
                .IsRequired()
                .HasColumnName("Dimensions_BoundingMinX")
                .HasColumnType("double precision");

            dimensionsBuilder.Property(d => d.BoundingMinY)
                .IsRequired()
                .HasColumnName("Dimensions_BoundingMinY")
                .HasColumnType("double precision");

            dimensionsBuilder.Property(d => d.BoundingMaxX)
                .IsRequired()
                .HasColumnName("Dimensions_BoundingMaxX")
                .HasColumnType("double precision");

            dimensionsBuilder.Property(d => d.BoundingMaxY)
                .IsRequired()
                .HasColumnName("Dimensions_BoundingMaxY")
                .HasColumnType("double precision");

            dimensionsBuilder.Property(d => d.Scale)
                .IsRequired()
                .HasColumnName("Dimensions_Scale")
                .HasColumnType("double precision")
                .HasDefaultValue(1.0);

            dimensionsBuilder.Property(d => d.MaintainAspectRatio)
                .IsRequired()
                .HasColumnName("Dimensions_MaintainAspectRatio")
                .HasDefaultValue(true);

            dimensionsBuilder.Property(d => d.MinScale)
                .IsRequired()
                .HasColumnName("Dimensions_MinScale")
                .HasColumnType("double precision")
                .HasDefaultValue(0.1);

            dimensionsBuilder.Property(d => d.MaxScale)
                .IsRequired()
                .HasColumnName("Dimensions_MaxScale")
                .HasColumnType("double precision")
                .HasDefaultValue(10.0);

            dimensionsBuilder.Property(d => d.Units)
                .IsRequired()
                .HasColumnName("Dimensions_Units")
                .HasMaxLength(50)
                .HasDefaultValue("drawing-units");
        });
    }

    private static void ConfigureStandardCompliance(EntityTypeBuilder<Symbol> builder)
    {
        builder.ComplexProperty(s => s.StandardCompliance, complianceBuilder =>
        {
            complianceBuilder.Property(sc => sc.PrimaryStandard)
                .IsRequired()
                .HasColumnName("StandardCompliance_PrimaryStandard")
                .HasMaxLength(50);

            complianceBuilder.Property(sc => sc.StandardVersion)
                .IsRequired()
                .HasColumnName("StandardCompliance_StandardVersion")
                .HasMaxLength(20);

            complianceBuilder.Property(sc => sc.CompatibleStandards)
                .HasColumnName("StandardCompliance_CompatibleStandards")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());

            complianceBuilder.Property(sc => sc.ComplianceNotes)
                .HasColumnName("StandardCompliance_ComplianceNotes")
                .HasMaxLength(500);

            complianceBuilder.Property(sc => sc.IsCertified)
                .IsRequired()
                .HasColumnName("StandardCompliance_IsCertified")
                .HasDefaultValue(false);

            complianceBuilder.Property(sc => sc.CertificationBody)
                .HasColumnName("StandardCompliance_CertificationBody")
                .HasMaxLength(100);

            complianceBuilder.Property(sc => sc.ComplianceDate)
                .HasColumnName("StandardCompliance_ComplianceDate")
                .HasColumnType("timestamp with time zone");

            complianceBuilder.Property(sc => sc.ExpirationDate)
                .HasColumnName("StandardCompliance_ExpirationDate")
                .HasColumnType("timestamp with time zone");

            complianceBuilder.Property(sc => sc.ApplicableSectors)
                .HasColumnName("StandardCompliance_ApplicableSectors")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());

            complianceBuilder.Property(sc => sc.GeographicScope)
                .HasColumnName("StandardCompliance_GeographicScope")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());
        });
    }

    private static void ConfigureConnectionPoints(EntityTypeBuilder<Symbol> builder)
    {
        // Simplified JSON conversion without complex expressions
        builder.Property(s => s.ConnectionPoints)
            .HasColumnName("ConnectionPoints")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<ConnectionPoint>>(v, (JsonSerializerOptions?)null) ?? new List<ConnectionPoint>(),
                new ValueComparer<List<ConnectionPoint>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()));
    }
}