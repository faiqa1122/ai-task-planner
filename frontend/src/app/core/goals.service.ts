import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GoalSummary, TaskItem, TaskSaveRequest, TaskStatus } from './models';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getGoals() {
    return this.http.get<GoalSummary[]>(`${this.api}/goals`);
  }

  getGoal(id: number) {
    return this.http.get<GoalSummary>(`${this.api}/goals/${id}`);
  }

  deleteGoal(id: number) {
    return this.http.delete<void>(`${this.api}/goals/${id}`);
  }

  getTasks(goalId: number) {
    return this.http.get<TaskItem[]>(`${this.api}/goals/${goalId}/tasks`);
  }

  addTask(goalId: number, body: TaskSaveRequest) {
    return this.http.post<TaskItem>(`${this.api}/goals/${goalId}/tasks`, body);
  }

  updateTask(id: number, body: TaskSaveRequest) {
    return this.http.put<TaskItem>(`${this.api}/tasks/${id}`, body);
  }

  changeStatus(id: number, status: TaskStatus) {
    return this.http.patch<TaskItem>(`${this.api}/tasks/${id}/status`, { status });
  }

  deleteTask(id: number) {
    return this.http.delete<void>(`${this.api}/tasks/${id}`);
  }
}