using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class SymbolMappingConfiguration : IEntityTypeConfiguration<SymbolMapping>
{
    public void Configure(EntityTypeBuilder<SymbolMapping> builder)
    {
        builder.ToTable("symbol_mappings");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(e => e.ExternalSymbolId)
            .HasColumnName("external_symbol_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.ExternalSymbolName)
            .HasColumnName("external_symbol_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.InternalComponentId)
            .HasColumnName("internal_component_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.InternalComponentName)
            .HasColumnName("internal_component_name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.LibraryType)
            .HasColumnName("library_type")
            .IsRequired();

        builder.Property(e => e.ConfidenceScore)
            .HasColumnName("confidence_score")
            .HasColumnType("double precision")
            .IsRequired();

        builder.Property(e => e.MappingMethod)
            .HasColumnName("mapping_method")
            .IsRequired();

        builder.Property(e => e.IsManuallyVerified)
            .HasColumnName("is_manually_verified")
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(e => e.SymbolCategoryId)
            .HasColumnName("symbol_category_id");

        builder.Property(e => e.VerifiedBy)
            .HasColumnName("verified_by")
            .HasMaxLength(100);

        builder.Property(e => e.VerifiedAt)
            .HasColumnName("verified_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(e => e.CreatedBy)
            .HasColumnName("created_by")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.ModifiedAt)
            .HasColumnName("modified_at")
            .HasColumnType("timestamp with time zone");

        builder.Property(e => e.ModifiedBy)
            .HasColumnName("modified_by")
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(e => e.ExternalSymbolId)
            .HasDatabaseName("ix_symbol_mappings_external_symbol_id");

        builder.HasIndex(e => e.LibraryType)
            .HasDatabaseName("ix_symbol_mappings_library_type");

        builder.HasIndex(e => new { e.ExternalSymbolId, e.LibraryType })
            .HasDatabaseName("ix_symbol_mappings_external_symbol_library")
            .IsUnique();

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("ix_symbol_mappings_is_active");

        builder.HasIndex(e => e.SymbolCategoryId)
            .HasDatabaseName("ix_symbol_mappings_symbol_category_id");

        // Relationships
        builder.HasOne(e => e.SymbolCategory)
            .WithMany()
            .HasForeignKey(e => e.SymbolCategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
