using Ergoplanner.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class ValidationViolationConfiguration : IEntityTypeConfiguration<ValidationViolation>
{
    public void Configure(EntityTypeBuilder<ValidationViolation> builder)
    {
        builder.ToTable("validation_violations");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.DrawingId)
            .IsRequired()
            .HasColumnName("drawing_id");

        builder.Property(v => v.ValidationRuleId)
            .IsRequired()
            .HasColumnName("validation_rule_id");

        builder.Property(v => v.ComponentId)
            .HasMaxLength(100)
            .HasColumnName("component_id");

        builder.Property(v => v.ComponentType)
            .HasMaxLength(50)
            .HasColumnName("component_type");

        builder.Property(v => v.Message)
            .IsRequired()
            .HasMaxLength(1000)
            .HasColumnName("message");

        builder.Property(v => v.Severity)
            .IsRequired()
            .HasColumnName("severity");

        builder.Property(v => v.ContextJson)
            .HasColumnType("jsonb")
            .HasColumnName("context_json");

        builder.Property(v => v.IsAcknowledged)
            .IsRequired()
            .HasColumnName("is_acknowledged");

        builder.Property(v => v.AcknowledgedBy)
            .HasMaxLength(100)
            .HasColumnName("acknowledged_by");

        builder.Property(v => v.AcknowledgedAt)
            .HasColumnName("acknowledged_at");

        builder.Property(v => v.AcknowledgementJustification)
            .HasMaxLength(1000)
            .HasColumnName("acknowledgement_justification");

        builder.Property(v => v.IsResolved)
            .IsRequired()
            .HasColumnName("is_resolved");

        builder.Property(v => v.DetectedAt)
            .IsRequired()
            .HasColumnName("detected_at");

        builder.Property(v => v.ResolvedAt)
            .HasColumnName("resolved_at");

        // Foreign keys
        builder.HasOne(v => v.Drawing)
            .WithMany()
            .HasForeignKey(v => v.DrawingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(v => v.ValidationRule)
            .WithMany()
            .HasForeignKey(v => v.ValidationRuleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(v => v.DrawingId)
            .HasDatabaseName("ix_validation_violations_drawing_id");

        builder.HasIndex(v => v.ValidationRuleId)
            .HasDatabaseName("ix_validation_violations_rule_id");

        builder.HasIndex(v => new { v.DrawingId, v.IsResolved })
            .HasDatabaseName("ix_validation_violations_drawing_resolved");

        builder.HasIndex(v => new { v.DrawingId, v.Severity, v.IsResolved })
            .HasDatabaseName("ix_validation_violations_drawing_severity_resolved");

        builder.HasIndex(v => v.DetectedAt)
            .HasDatabaseName("ix_validation_violations_detected_at");

        // Audit fields
        builder.Property(v => v.CreatedAt)
            .IsRequired()
            .HasColumnName("created_at");

        builder.Property(v => v.CreatedBy)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("created_by");

        builder.Property(v => v.ModifiedAt)
            .HasColumnName("modified_at");

        builder.Property(v => v.ModifiedBy)
            .HasMaxLength(100)
            .HasColumnName("modified_by");
    }
}
