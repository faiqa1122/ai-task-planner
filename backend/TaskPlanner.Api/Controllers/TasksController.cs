using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskPlanner.Api.Data;
using TaskPlanner.Api.DTOs;
using TaskPlanner.Api.Models;

namespace TaskPlanner.Api.Controllers;

[ApiController]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    private int UserId => int.Parse(User.FindFirst("sub")!.Value);

    private static TaskResponseDto ToDto(TaskItem t) => new()
    {
        Id = t.Id,
        GoalId = t.GoalId,
        Title = t.Title,
        Description = t.Description,
        Priority = t.Priority,
        EstimatedHours = t.EstimatedHours,
        Status = t.Status,
        DueDate = t.DueDate,
        SortOrder = t.SortOrder
    };

    private Task<TaskItem?> FindOwnTask(int id) =>
        _db.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.Goal!.UserId == UserId);

    [HttpGet("api/goals/{goalId}/tasks")]
    public async Task<ActionResult<List<TaskResponseDto>>> GetByGoal(int goalId)
    {
        var owns = await _db.Goals.AnyAsync(g => g.Id == goalId && g.UserId == UserId);
        if (!owns) return NotFound();

        var tasks = await _db.TaskItems
            .Where(t => t.GoalId == goalId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return Ok(tasks.Select(ToDto).ToList());
    }

    [HttpPost("api/goals/{goalId}/tasks")]
    public async Task<ActionResult<TaskResponseDto>> Create(int goalId, TaskSaveDto dto)
    {
        var owns = await _db.Goals.AnyAsync(g => g.Id == goalId && g.UserId == UserId);
        if (!owns) return NotFound();

        var lastOrder = await _db.TaskItems
            .Where(t => t.GoalId == goalId)
            .MaxAsync(t => (int?)t.SortOrder) ?? 0;

        var task = new TaskItem
        {
            GoalId = goalId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Priority = dto.Priority,
            EstimatedHours = dto.EstimatedHours,
            DueDate = dto.DueDate,
            Status = dto.Status,
            SortOrder = lastOrder + 1
        };

        _db.TaskItems.Add(task);
        await _db.SaveChangesAsync();

        return Ok(ToDto(task));
    }

    [HttpPut("api/tasks/{id}")]
    public async Task<ActionResult<TaskResponseDto>> Update(int id, TaskSaveDto dto)
    {
        var task = await FindOwnTask(id);
        if (task == null) return NotFound();

        task.Title = dto.Title.Trim();
        task.Description = dto.Description?.Trim();
        task.Priority = dto.Priority;
        task.EstimatedHours = dto.EstimatedHours;
        task.DueDate = dto.DueDate;
        task.Status = dto.Status;

        await _db.SaveChangesAsync();
        return Ok(ToDto(task));
    }

    [HttpPatch("api/tasks/{id}/status")]
    public async Task<ActionResult<TaskResponseDto>> ChangeStatus(int id, TaskStatusDto dto)
    {
        var task = await FindOwnTask(id);
        if (task == null) return NotFound();

        task.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(ToDto(task));
    }

    [HttpDelete("api/tasks/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await FindOwnTask(id);
        if (task == null) return NotFound();

        _db.TaskItems.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}