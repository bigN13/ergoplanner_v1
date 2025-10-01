using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ergoplanner.Domain.Entities;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class SymbolLibraryConfiguration : IEntityTypeConfiguration<SymbolLibrary>
{
    public void Configure(EntityTypeBuilder<SymbolLibrary> builder)
    {
        builder.ToTable("symbol_libraries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(e => e.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.Type)
            .HasColumnName("type")
            .IsRequired();

        builder.Property(e => e.Version)
            .HasColumnName("version")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.SymbolCount)
            .HasColumnName("symbol_count")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(e => e.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

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
        builder.HasIndex(e => e.Type)
            .HasDatabaseName("ix_symbol_libraries_type");

        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("ix_symbol_libraries_is_active");

        builder.HasIndex(e => new { e.Name, e.Version })
            .HasDatabaseName("ix_symbol_libraries_name_version")
            .IsUnique();

        // Relationships
        builder.HasMany(e => e.Symbols)
            .WithOne(s => s.Library)
            .HasForeignKey(s => s.LibraryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
