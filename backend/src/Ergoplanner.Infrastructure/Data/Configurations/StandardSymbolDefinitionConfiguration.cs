using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class StandardSymbolDefinitionConfiguration : IEntityTypeConfiguration<StandardSymbolDefinition>
{
    public void Configure(EntityTypeBuilder<StandardSymbolDefinition> builder)
    {
        builder.ToTable("standard_symbol_definitions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(e => e.LibraryId)
            .HasColumnName("library_id")
            .IsRequired();

        builder.Property(e => e.SymbolCode)
            .HasColumnName("symbol_code")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.Category)
            .HasColumnName("category")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Subcategory)
            .HasColumnName("subcategory")
            .HasMaxLength(100);

        builder.Property(e => e.SvgPath)
            .HasColumnName("svg_path")
            .HasColumnType("text");

        builder.Property(e => e.ImageData)
            .HasColumnName("image_data")
            .HasColumnType("text");

        builder.Property(e => e.Tags)
            .HasColumnName("tags")
            .HasMaxLength(500)
            .IsRequired()
            .HasDefaultValue("");

        builder.Property(e => e.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.SymbolCategoryId)
            .HasColumnName("symbol_category_id");

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
        builder.HasIndex(e => e.LibraryId)
            .HasDatabaseName("ix_standard_symbol_definitions_library_id");

        builder.HasIndex(e => new { e.LibraryId, e.SymbolCode })
            .HasDatabaseName("ix_standard_symbol_definitions_library_code")
            .IsUnique();

        builder.HasIndex(e => e.Category)
            .HasDatabaseName("ix_standard_symbol_definitions_category");

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("ix_standard_symbol_definitions_is_active");

        builder.HasIndex(e => e.SymbolCategoryId)
            .HasDatabaseName("ix_standard_symbol_definitions_symbol_category_id");

        // Full-text search on name and tags
        builder.HasIndex(e => e.Name)
            .HasDatabaseName("ix_standard_symbol_definitions_name");

        // Relationships
        builder.HasOne(e => e.Library)
            .WithMany(l => l.Symbols)
            .HasForeignKey(e => e.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.SymbolCategory)
            .WithMany()
            .HasForeignKey(e => e.SymbolCategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
