using Ergoplanner.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ergoplanner.Infrastructure.Data.Configurations;

public class ValidationRuleConfiguration : IEntityTypeConfiguration<ValidationRule>
{
    public void Configure(EntityTypeBuilder<ValidationRule> builder)
    {
        builder.ToTable("validation_rules");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.RuleCode)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("rule_code");

        builder.Property(v => v.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(v => v.Description)
            .IsRequired()
            .HasMaxLength(1000)
            .HasColumnName("description");

        builder.Property(v => v.Category)
            .IsRequired()
            .HasColumnName("category");

        builder.Property(v => v.Severity)
            .IsRequired()
            .HasColumnName("severity");

        builder.Property(v => v.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        builder.Property(v => v.ConfigurationJson)
            .HasColumnType("jsonb")
            .HasColumnName("configuration_json");

        builder.Property(v => v.StandardReference)
            .HasMaxLength(200)
            .HasColumnName("standard_reference");

        builder.Property(v => v.ViolationMessageTemplate)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("violation_message_template");

        builder.Property(v => v.RemediationGuidance)
            .HasMaxLength(1000)
            .HasColumnName("remediation_guidance");

        builder.Property(v => v.ExecutionOrder)
            .IsRequired()
            .HasColumnName("execution_order");

        // Indexes
        builder.HasIndex(v => v.RuleCode)
            .IsUnique()
            .HasDatabaseName("ix_validation_rules_rule_code");

        builder.HasIndex(v => new { v.Category, v.IsActive })
            .HasDatabaseName("ix_validation_rules_category_active");

        builder.HasIndex(v => v.ExecutionOrder)
            .HasDatabaseName("ix_validation_rules_execution_order");

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
