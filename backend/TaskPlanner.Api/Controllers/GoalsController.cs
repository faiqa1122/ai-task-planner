using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskPlanner.Api.Data;
using TaskPlanner.Api.DTOs;
using TaskPlanner.Api.Models;

namespace TaskPlanner.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private readonly AppDbContext _db;

    public GoalsController(AppDbContext db)
    {
        _db = db;
    }

    private int UserId => int.Parse(User.FindFirst("sub")!.Value);

    private static GoalResponseDto ToDto(Goal g) => new()
    {
        Id = g.Id,
        Title = g.Title,
        Description = g.Description,
        Deadline = g.Deadline,
        CreatedAt = g.CreatedAt,
        TaskCount = g.Tasks.Count,
        DoneCount = g.Tasks.Count(t => t.Status == TaskItemStatus.Done)
    };

    [HttpGet]
    public async Task<ActionResult<List<GoalResponseDto>>> GetAll()
    {
        var goals = await _db.Goals
            .Include(g => g.Tasks)
            .Where(g => g.UserId == UserId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();

        return Ok(goals.Select(ToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoalResponseDto>> GetById(int id)
    {
        var goal = await _db.Goals
            .Include(g => g.Tasks)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == UserId);

        if (goal == null) return NotFound();
        return Ok(ToDto(goal));
    }

    [HttpPost]
    public async Task<ActionResult<GoalResponseDto>> Create(GoalSaveDto dto)
    {
        var goal = new Goal
        {
            UserId = UserId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Deadline = dto.Deadline
        };

        _db.Goals.Add(goal);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = goal.Id }, ToDto(goal));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GoalResponseDto>> Update(int id, GoalSaveDto dto)
    {
        var goal = await _db.Goals
            .Include(g => g.Tasks)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == UserId);

        if (goal == null) return NotFound();

        goal.Title = dto.Title.Trim();
        goal.Description = dto.Description?.Trim();
        goal.Deadline = dto.Deadline;

        await _db.SaveChangesAsync();
        return Ok(ToDto(goal));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var goal = await _db.Goals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == UserId);
        if (goal == null) return NotFound();

        _db.Goals.Remove(goal);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}