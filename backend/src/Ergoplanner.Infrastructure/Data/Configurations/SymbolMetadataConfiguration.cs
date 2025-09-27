using Ergoplanner.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class SymbolMetadataConfiguration : IEntityTypeConfiguration<SymbolMetadata>
{
    public void Configure(EntityTypeBuilder<SymbolMetadata> builder)
    {
        builder.ToTable("symbol_metadata");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        // Identification Properties
        builder.Property(e => e.TagNumber)
            .HasColumnName("tag_number")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.Category)
            .HasColumnName("category")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.SubCategory)
            .HasColumnName("sub_category")
            .HasMaxLength(100)
            .IsRequired();

        // Technical Specifications
        builder.Property(e => e.Size)
            .HasColumnName("size")
            .HasMaxLength(50);

        builder.Property(e => e.Rating)
            .HasColumnName("rating")
            .HasMaxLength(50);

        builder.Property(e => e.Material)
            .HasColumnName("material")
            .HasMaxLength(100);

        builder.Property(e => e.Type)
            .HasColumnName("type")
            .HasMaxLength(100);

        builder.Property(e => e.Model)
            .HasColumnName("model")
            .HasMaxLength(100);

        builder.Property(e => e.Manufacturer)
            .HasColumnName("manufacturer")
            .HasMaxLength(200);

        // Process Data
        builder.Property(e => e.Service)
            .HasColumnName("service")
            .HasMaxLength(200);

        builder.Property(e => e.DesignPressure)
            .HasColumnName("design_pressure")
            .HasPrecision(18, 4);

        builder.Property(e => e.DesignPressureUnit)
            .HasColumnName("design_pressure_unit")
            .HasMaxLength(20);

        builder.Property(e => e.DesignTemperature)
            .HasColumnName("design_temperature")
            .HasPrecision(18, 4);

        builder.Property(e => e.DesignTemperatureUnit)
            .HasColumnName("design_temperature_unit")
            .HasMaxLength(20);

        builder.Property(e => e.FlowRate)
            .HasColumnName("flow_rate")
            .HasPrecision(18, 4);

        builder.Property(e => e.FlowRateUnit)
            .HasColumnName("flow_rate_unit")
            .HasMaxLength(20);

        builder.Property(e => e.OperatingPressure)
            .HasColumnName("operating_pressure")
            .HasPrecision(18, 4);

        builder.Property(e => e.OperatingPressureUnit)
            .HasColumnName("operating_pressure_unit")
            .HasMaxLength(20);

        builder.Property(e => e.OperatingTemperature)
            .HasColumnName("operating_temperature")
            .HasPrecision(18, 4);

        builder.Property(e => e.OperatingTemperatureUnit)
            .HasColumnName("operating_temperature_unit")
            .HasMaxLength(20);

        // Standards Compliance
        builder.Property(e => e.ISAStandard)
            .HasColumnName("isa_standard")
            .HasMaxLength(100);

        builder.Property(e => e.PIPStandard)
            .HasColumnName("pip_standard")
            .HasMaxLength(100);

        builder.Property(e => e.ISOStandard)
            .HasColumnName("iso_standard")
            .HasMaxLength(100);

        builder.Property(e => e.DINStandard)
            .HasColumnName("din_standard")
            .HasMaxLength(100);

        builder.Property(e => e.BSStandard)
            .HasColumnName("bs_standard")
            .HasMaxLength(100);

        // JSONB column for custom properties with GIN index
        builder.Property(e => e.CustomProperties)
            .HasColumnName("custom_properties")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions)null!) ?? new Dictionary<string, object>()
            );

        // Create GIN index for JSONB column for performance
        builder.HasIndex(e => e.CustomProperties)
            .HasMethod("gin");

        // Relationships
        builder.Property(e => e.SymbolId)
            .HasColumnName("symbol_id")
            .IsRequired();

        builder.HasOne(e => e.Symbol)
            .WithOne(s => s.SymbolMetadata)
            .HasForeignKey<SymbolMetadata>(e => e.SymbolId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(e => e.ParentMetadataId)
            .HasColumnName("parent_metadata_id");

        builder.HasOne(e => e.ParentMetadata)
            .WithMany(e => e.ChildMetadata)
            .HasForeignKey(e => e.ParentMetadataId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(e => e.TemplateId)
            .HasColumnName("template_id")
            .HasMaxLength(100);

        // Audit Properties
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(e => e.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.LastModifiedAt)
            .HasColumnName("last_modified_at");

        builder.Property(e => e.LastModifiedBy)
            .HasColumnName("last_modified_by")
            .HasMaxLength(255);

        builder.Property(e => e.Version)
            .HasColumnName("version")
            .IsRequired()
            .IsConcurrencyToken();

        builder.Property(e => e.ModifiedAt)
            .HasColumnName("modified_at");

        builder.Property(e => e.ModifiedBy)
            .HasColumnName("modified_by")
            .HasMaxLength(255);

        builder.Property(e => e.IsDeleted)
            .HasColumnName("is_deleted")
            .HasDefaultValue(false);

        builder.Property(e => e.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(e => e.DeletedBy)
            .HasColumnName("deleted_by")
            .HasMaxLength(255);

        builder.Property(e => e.RowVersion)
            .HasColumnName("row_version")
            .IsRowVersion()
            .IsConcurrencyToken();

        // Indexes
        builder.HasIndex(e => e.TagNumber)
            .HasDatabaseName("ix_symbol_metadata_tag_number");

        builder.HasIndex(e => e.Name)
            .HasDatabaseName("ix_symbol_metadata_name");

        builder.HasIndex(e => e.Category)
            .HasDatabaseName("ix_symbol_metadata_category");

        builder.HasIndex(e => new { e.Category, e.SubCategory })
            .HasDatabaseName("ix_symbol_metadata_category_subcategory");

        builder.HasIndex(e => e.SymbolId)
            .HasDatabaseName("ix_symbol_metadata_symbol_id")
            .IsUnique();

        builder.HasIndex(e => e.IsDeleted)
            .HasDatabaseName("ix_symbol_metadata_is_deleted");

        // Global query filter for soft delete
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}