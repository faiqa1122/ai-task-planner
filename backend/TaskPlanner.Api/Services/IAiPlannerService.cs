using TaskPlanner.Api.DTOs;

namespace TaskPlanner.Api.Services;

public interface IAiPlannerService
{
    Task<List<PlannedTaskDto>> GeneratePlanAsync(GeneratePlanDto input, CancellationToken ct);
}