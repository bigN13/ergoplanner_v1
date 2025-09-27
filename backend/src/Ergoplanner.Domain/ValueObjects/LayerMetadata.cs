using System.Text.Json;

namespace Ergoplanner.Domain.ValueObjects;

/// <summary>
/// Value object containing flexible metadata storage for layers
/// Designed to be stored as JSONB in PostgreSQL for efficient querying
/// </summary>
public class LayerMetadata
{
    /// <summary>
    /// Revision number for layer metadata changes
    /// </summary>
    public int Revision { get; }

    /// <summary>
    /// Category or classification of the layer
    /// </summary>
    public string? Category { get; }

    /// <summary>
    /// Tags for searching and filtering
    /// </summary>
    public IReadOnlyList<string> Tags { get; }

    /// <summary>
    /// Custom properties specific to this layer
    /// </summary>
    public IReadOnlyDictionary<string, object> CustomProperties { get; }

    /// <summary>
    /// Layer creation context information
    /// </summary>
    public LayerCreationContext? CreationContext { get; }

    /// <summary>
    /// Print-specific settings for this layer
    /// </summary>
    public PrintSettings? PrintSettings { get; }

    /// <summary>
    /// Export settings for different formats
    /// </summary>
    public ExportSettings? ExportSettings { get; }

    /// <summary>
    /// Validation rules for elements on this layer
    /// </summary>
    public ValidationRules? ValidationRules { get; }

    /// <summary>
    /// Layer behavior configuration
    /// </summary>
    public LayerBehavior? LayerBehavior { get; }

    public LayerMetadata(
        int revision = 1,
        string? category = null,
        IEnumerable<string>? tags = null,
        IDictionary<string, object>? customProperties = null,
        LayerCreationContext? creationContext = null,
        PrintSettings? printSettings = null,
        ExportSettings? exportSettings = null,
        ValidationRules? validationRules = null,
        LayerBehavior? layerBehavior = null)
    {
        Revision = Math.Max(1, revision);
        Category = category;
        Tags = (tags ?? Array.Empty<string>()).ToList().AsReadOnly();
        CustomProperties = (customProperties ?? new Dictionary<string, object>()).AsReadOnly();
        CreationContext = creationContext;
        PrintSettings = printSettings;
        ExportSettings = exportSettings;
        ValidationRules = validationRules;
        LayerBehavior = layerBehavior;
    }

    /// <summary>
    /// Create empty metadata
    /// </summary>
    public static LayerMetadata Empty()
    {
        return new LayerMetadata();
    }

    /// <summary>
    /// Create metadata for a piping layer
    /// </summary>
    public static LayerMetadata ForPiping(string? pipeClass = null, string? material = null)
    {
        var customProperties = new Dictionary<string, object>();
        if (!string.IsNullOrWhiteSpace(pipeClass))
            customProperties["PipeClass"] = pipeClass;
        if (!string.IsNullOrWhiteSpace(material))
            customProperties["Material"] = material;

        return new LayerMetadata(
            category: "Piping",
            tags: new[] { "piping", "process" },
            customProperties: customProperties,
            validationRules: ValidationRules.ForPiping(),
            layerBehavior: LayerBehavior.ForPiping());
    }

    /// <summary>
    /// Create metadata for an instrumentation layer
    /// </summary>
    public static LayerMetadata ForInstrumentation(string? loopPrefix = null)
    {
        var customProperties = new Dictionary<string, object>();
        if (!string.IsNullOrWhiteSpace(loopPrefix))
            customProperties["LoopPrefix"] = loopPrefix;

        return new LayerMetadata(
            category: "Instrumentation",
            tags: new[] { "instruments", "control" },
            customProperties: customProperties,
            validationRules: ValidationRules.ForInstrumentation(),
            layerBehavior: LayerBehavior.ForInstrumentation());
    }

    /// <summary>
    /// Create metadata for an annotation layer
    /// </summary>
    public static LayerMetadata ForAnnotation()
    {
        return new LayerMetadata(
            category: "Annotation",
            tags: new[] { "annotations", "text", "notes" },
            layerBehavior: LayerBehavior.ForAnnotation());
    }

    /// <summary>
    /// Create a copy with updated revision
    /// </summary>
    public LayerMetadata WithRevision(int newRevision)
    {
        return new LayerMetadata(
            newRevision,
            Category,
            Tags,
            CustomProperties.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            CreationContext,
            PrintSettings,
            ExportSettings,
            ValidationRules,
            LayerBehavior);
    }

    /// <summary>
    /// Create a copy with additional tags
    /// </summary>
    public LayerMetadata WithTags(params string[] additionalTags)
    {
        var newTags = Tags.Concat(additionalTags).Distinct().ToList();
        return new LayerMetadata(
            Revision + 1,
            Category,
            newTags,
            CustomProperties.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            CreationContext,
            PrintSettings,
            ExportSettings,
            ValidationRules,
            LayerBehavior);
    }

    /// <summary>
    /// Create a copy with additional custom properties
    /// </summary>
    public LayerMetadata WithCustomProperties(IDictionary<string, object> additionalProperties)
    {
        var newProperties = new Dictionary<string, object>(CustomProperties);
        foreach (var kvp in additionalProperties)
        {
            newProperties[kvp.Key] = kvp.Value;
        }

        return new LayerMetadata(
            Revision + 1,
            Category,
            Tags,
            newProperties.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            CreationContext,
            PrintSettings,
            ExportSettings,
            ValidationRules,
            LayerBehavior);
    }

    /// <summary>
    /// Create a copy with updated print settings
    /// </summary>
    public LayerMetadata WithPrintSettings(PrintSettings printSettings)
    {
        return new LayerMetadata(
            Revision + 1,
            Category,
            Tags,
            CustomProperties.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            CreationContext,
            printSettings,
            ExportSettings,
            ValidationRules,
            LayerBehavior);
    }

    /// <summary>
    /// Get custom property value by key
    /// </summary>
    public T? GetCustomProperty<T>(string key)
    {
        if (CustomProperties.TryGetValue(key, out var value))
        {
            if (value is T directValue)
                return directValue;

            if (value is JsonElement jsonElement)
                return JsonSerializer.Deserialize<T>(jsonElement.GetRawText());
        }

        return default;
    }

    /// <summary>
    /// Check if metadata has a specific tag
    /// </summary>
    public bool HasTag(string tag)
    {
        return Tags.Contains(tag, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Check if metadata has a specific custom property
    /// </summary>
    public bool HasCustomProperty(string key)
    {
        return CustomProperties.ContainsKey(key);
    }

    /// <summary>
    /// Create a deep copy of this metadata
    /// </summary>
    public LayerMetadata Clone()
    {
        var clonedProperties = new Dictionary<string, object>();
        foreach (var kvp in CustomProperties)
        {
            clonedProperties[kvp.Key] = kvp.Value;
        }

        return new LayerMetadata(
            Revision,
            Category,
            Tags.ToList(),
            clonedProperties,
            CreationContext?.Clone(),
            PrintSettings?.Clone(),
            ExportSettings?.Clone(),
            ValidationRules?.Clone(),
            LayerBehavior?.Clone());
    }

    /// <summary>
    /// Serialize to JSON for database storage
    /// </summary>
    public string ToJson()
    {
        var data = new
        {
            Revision,
            Category,
            Tags = Tags.ToArray(),
            CustomProperties,
            CreationContext,
            PrintSettings,
            ExportSettings,
            ValidationRules,
            LayerBehavior
        };

        return JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });
    }

    /// <summary>
    /// Deserialize from JSON
    /// </summary>
    public static LayerMetadata FromJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return Empty();

        try
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;

            var revision = root.TryGetProperty("revision", out var revProp) ? revProp.GetInt32() : 1;
            var category = root.TryGetProperty("category", out var catProp) ? catProp.GetString() : null;

            var tags = new List<string>();
            if (root.TryGetProperty("tags", out var tagsProp) && tagsProp.ValueKind == JsonValueKind.Array)
            {
                tags.AddRange(tagsProp.EnumerateArray().Select(t => t.GetString()).Where(t => !string.IsNullOrEmpty(t))!);
            }

            var customProperties = new Dictionary<string, object>();
            if (root.TryGetProperty("customProperties", out var propsProp) && propsProp.ValueKind == JsonValueKind.Object)
            {
                foreach (var property in propsProp.EnumerateObject())
                {
                    customProperties[property.Name] = property.Value.Clone();
                }
            }

            return new LayerMetadata(
                revision,
                category,
                tags,
                customProperties);
        }
        catch (JsonException)
        {
            return Empty();
        }
    }

    public override bool Equals(object? obj)
    {
        return obj is LayerMetadata other &&
               Revision == other.Revision &&
               Category == other.Category &&
               Tags.SequenceEqual(other.Tags) &&
               CustomProperties.Count == other.CustomProperties.Count &&
               CustomProperties.All(kvp => other.CustomProperties.TryGetValue(kvp.Key, out var value) &&
                                          Equals(kvp.Value, value));
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(
            Revision,
            Category,
            Tags.GetHashCode(),
            CustomProperties.GetHashCode());
    }
}

/// <summary>
/// Layer creation context information
/// </summary>
public class LayerCreationContext
{
    public string TemplateId { get; }
    public string CreatedFromType { get; }
    public string? SourceLayerId { get; }
    public DateTime CreatedAt { get; }

    public LayerCreationContext(
        string templateId,
        string createdFromType,
        string? sourceLayerId = null,
        DateTime? createdAt = null)
    {
        TemplateId = templateId ?? throw new ArgumentNullException(nameof(templateId));
        CreatedFromType = createdFromType ?? throw new ArgumentNullException(nameof(createdFromType));
        SourceLayerId = sourceLayerId;
        CreatedAt = createdAt ?? DateTime.UtcNow;
    }

    public LayerCreationContext Clone() => new(TemplateId, CreatedFromType, SourceLayerId, CreatedAt);
}

/// <summary>
/// Print-specific settings for layers
/// </summary>
public class PrintSettings
{
    public bool IncludeInPrint { get; }
    public string? PrintColor { get; }
    public double PrintLineWidth { get; }
    public int PrintOrder { get; }

    public PrintSettings(
        bool includeInPrint = true,
        string? printColor = null,
        double printLineWidth = 1.0,
        int printOrder = 0)
    {
        IncludeInPrint = includeInPrint;
        PrintColor = printColor;
        PrintLineWidth = Math.Max(0.1, printLineWidth);
        PrintOrder = printOrder;
    }

    public PrintSettings Clone() => new(IncludeInPrint, PrintColor, PrintLineWidth, PrintOrder);
}

/// <summary>
/// Export settings for different formats
/// </summary>
public class ExportSettings
{
    public bool IncludeInDXF { get; }
    public bool IncludeInPDF { get; }
    public bool IncludeInSVG { get; }
    public string? ExportLayerName { get; }

    public ExportSettings(
        bool includeInDXF = true,
        bool includeInPDF = true,
        bool includeInSVG = true,
        string? exportLayerName = null)
    {
        IncludeInDXF = includeInDXF;
        IncludeInPDF = includeInPDF;
        IncludeInSVG = includeInSVG;
        ExportLayerName = exportLayerName;
    }

    public ExportSettings Clone() => new(IncludeInDXF, IncludeInPDF, IncludeInSVG, ExportLayerName);
}

/// <summary>
/// Validation rules for elements on the layer
/// </summary>
public class ValidationRules
{
    public bool RequireConnections { get; }
    public bool AllowOverlapping { get; }
    public string[] AllowedElementTypes { get; }
    public int MaxElementCount { get; }

    public ValidationRules(
        bool requireConnections = false,
        bool allowOverlapping = true,
        string[]? allowedElementTypes = null,
        int maxElementCount = int.MaxValue)
    {
        RequireConnections = requireConnections;
        AllowOverlapping = allowOverlapping;
        AllowedElementTypes = allowedElementTypes ?? Array.Empty<string>();
        MaxElementCount = Math.Max(0, maxElementCount);
    }

    public static ValidationRules ForPiping() => new(true, false, new[] { "Pipe", "Valve", "Pump", "Vessel" });
    public static ValidationRules ForInstrumentation() => new(false, true, new[] { "Instrument", "Control" });

    public ValidationRules Clone() => new(RequireConnections, AllowOverlapping, AllowedElementTypes, MaxElementCount);
}

/// <summary>
/// Layer behavior configuration
/// </summary>
public class LayerBehavior
{
    public bool AutoConnect { get; }
    public bool AutoArrange { get; }
    public bool ShowOnMinimap { get; }
    public bool ParticipateInSearch { get; }

    public LayerBehavior(
        bool autoConnect = false,
        bool autoArrange = true,
        bool showOnMinimap = true,
        bool participateInSearch = true)
    {
        AutoConnect = autoConnect;
        AutoArrange = autoArrange;
        ShowOnMinimap = showOnMinimap;
        ParticipateInSearch = participateInSearch;
    }

    public static LayerBehavior ForPiping() => new(true, true, true, true);
    public static LayerBehavior ForInstrumentation() => new(false, true, true, true);
    public static LayerBehavior ForAnnotation() => new(false, false, false, true);

    public LayerBehavior Clone() => new(AutoConnect, AutoArrange, ShowOnMinimap, ParticipateInSearch);
}