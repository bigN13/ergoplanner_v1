namespace Ergoplanner.MLServices.Services;

public interface IPIDGenerationService
{
    Task<string> GenerateDrawingFromTextAsync(string description);
    Task<string> AnalyzeDrawingAsync(byte[] drawingData);
    Task<List<string>> GetEquipmentRecommendationsAsync(string processType);
    Task<bool> ValidateDrawingComplianceAsync(byte[] drawingData, string standard);
}