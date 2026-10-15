using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskPlanner.Api.Data;
using TaskPlanner.Api.DTOs;
using TaskPlanner.Api.Models;
using TaskPlanner.Api.Services;

namespace TaskPlanner.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PlannerController : ControllerBase
{
    private readonly IAiPlannerService _planner;
    private readonly AppDbContext _db;

    public PlannerController(IAiPlannerService planner, AppDbContext db)
    {
        _planner = planner;
        _db = db;
    }

    private int UserId => int.Parse(User.FindFirst("sub")!.Value);

    [HttpPost("preview")]
    public async Task<ActionResult<PlanPreviewDto>> Preview(GeneratePlanDto dto, CancellationToken ct)
    {
        try
        {
            var tasks = await _planner.GeneratePlanAsync(dto, ct);

            return Ok(new PlanPreviewDto
            {
                GoalTitle = dto.Title.Trim(),
                Tasks = tasks
            });
        }
        catch (AiPlannerException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
    }

    [HttpPost("save")]
    public async Task<ActionResult<GoalResponseDto>> Save(SavePlanDto dto)
    {
        var goal = new Goal
        {
            UserId = UserId,
            Title = dto.Goal.Title.Trim(),
            Description = dto.Goal.Description?.Trim(),
            Deadline = dto.Goal.Deadline
        };

        var order = 1;
        foreach (var t in dto.Tasks)
        {
            goal.Tasks.Add(new TaskItem
            {
                Title = t.Title.Trim(),
                Description = t.Description?.Trim(),
                Priority = t.Priority,
                EstimatedHours = t.EstimatedHours,
                DueDate = t.DueDate,
                Status = t.Status,
                SortOrder = order++
            });
        }

        _db.Goals.Add(goal);
        await _db.SaveChangesAsync();

        return Ok(new GoalResponseDto
        {
            Id = goal.Id,
            Title = goal.Title,
            Description = goal.Description,
            Deadline = goal.Deadline,
            CreatedAt = goal.CreatedAt,
            TaskCount = goal.Tasks.Count,
            DoneCount = 0
        });
    }
}