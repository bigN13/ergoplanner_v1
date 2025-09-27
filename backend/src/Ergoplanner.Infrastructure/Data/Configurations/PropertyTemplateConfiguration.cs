using Ergoplanner.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class PropertyTemplateConfiguration : IEntityTypeConfiguration<PropertyTemplate>
{
    public void Configure(EntityTypeBuilder<PropertyTemplate> builder)
    {
        builder.ToTable("property_templates");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.EquipmentType)
            .HasColumnName("equipment_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Category)
            .HasColumnName("category")
            .HasMaxLength(100)
            .IsRequired();

        // Property definitions as JSONB
        builder.Property(e => e.RequiredProperties)
            .HasColumnName("required_properties")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>()
            );

        builder.Property(e => e.OptionalProperties)
            .HasColumnName("optional_properties")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>()
            );

        builder.Property(e => e.DefaultValues)
            .HasColumnName("default_values")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions)null!) ?? new Dictionary<string, object>()
            );

        builder.Property(e => e.ValidationRules)
            .HasColumnName("validation_rules")
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions)null!) ?? new Dictionary<string, string>()
            );

        // Audit
        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(e => e.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // Base entity properties
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
        builder.HasIndex(e => e.Name)
            .HasDatabaseName("ix_property_templates_name")
            .IsUnique();

        builder.HasIndex(e => e.EquipmentType)
            .HasDatabaseName("ix_property_templates_equipment_type");

        builder.HasIndex(e => e.Category)
            .HasDatabaseName("ix_property_templates_category");

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("ix_property_templates_is_active");

        // Global query filter for soft delete
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}