export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface PlannedTask {
  title: string;
  description: string | null;
  priority: Priority;
  estimatedHours: number | null;
}

export interface GeneratePlanRequest {
  title: string;
  description: string | null;
  deadline: string | null;
}

export interface PlanPreview {
  goalTitle: string;
  tasks: PlannedTask[];
}

export interface SavePlanRequest {
  goal: {
    title: string;
    description: string | null;
    deadline: string | null;
  };
  tasks: (PlannedTask & { status: TaskStatus })[];
}

export interface GoalSummary {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  createdAt: string;
  taskCount: number;
  doneCount: number;
}