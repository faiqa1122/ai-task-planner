import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GeneratePlanRequest, GoalSummary, PlanPreview, SavePlanRequest } from './models';

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/planner`;

  preview(body: GeneratePlanRequest) {
    return this.http.post<PlanPreview>(`${this.base}/preview`, body);
  }

  save(body: SavePlanRequest) {
    return this.http.post<GoalSummary>(`${this.base}/save`, body);
  }
}