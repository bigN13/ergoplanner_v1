using Ergoplanner.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ergoplanner.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for Drawing entity
/// This is a minimal implementation to support Layer relationships
/// </summary>
public class DrawingConfiguration : IEntityTypeConfiguration<Drawing>
{
    public void Configure(EntityTypeBuilder<Drawing> builder)
    {
        // Table configuration
        builder.ToTable("Drawings");

        // Primary key
        builder.HasKey(d => d.Id);

        // Indexes
        builder.HasIndex(d => d.Name)
            .HasDatabaseName("IX_Drawings_Name");

        builder.HasIndex(d => d.CreatedAt)
            .HasDatabaseName("IX_Drawings_CreatedAt");

        builder.HasIndex(d => d.ModifiedAt)
            .HasDatabaseName("IX_Drawings_ModifiedAt");

        builder.HasIndex(d => d.IsDeleted)
            .HasDatabaseName("IX_Drawings_IsDeleted");

        // Properties
        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200)
            .IsUnicode(true);

        builder.Property(d => d.Description)
            .IsRequired()
            .HasMaxLength(1000)
            .IsUnicode(true);

        // Relationships
        builder.HasMany(d => d.Layers)
            .WithOne(l => l.Drawing)
            .HasForeignKey(l => l.DrawingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Audit fields from BaseEntity
        builder.Property(d => d.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(d => d.CreatedBy)
            .IsRequired()
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(d => d.ModifiedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(d => d.ModifiedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Soft delete fields
        builder.Property(d => d.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(d => d.DeletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(d => d.DeletedBy)
            .HasMaxLength(100)
            .IsUnicode(false);

        // Optimistic concurrency
        builder.Property(d => d.RowVersion)
            .IsRowVersion()
            .HasColumnName("xmin")
            .HasColumnType("xid");

        // Query filter for soft delete
        builder.HasQueryFilter(d => !d.IsDeleted);
    }
}