namespace TaskPlanner.Api.Services;

public class AiPlannerException : Exception
{
    public int StatusCode { get; }

    public AiPlannerException(string message, int statusCode = 502) : base(message)
    {
        StatusCode = statusCode;
    }
}