// src/app/services/notification-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import {NotificationPayload} from '../../models/NotificationPayload';

export type NotifStatut = 'NON_LU' | 'LU';

export interface NotificationPage {
  content: NotificationPayload[];
  totalElements: number;
  totalPages: number;
  number: number;          // page index
  size: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  list(page=0, size=10, statut?: NotifStatut): Observable<NotificationPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) params = params.set('statut', statut);
    return this.http.get<NotificationPage>(this.base, { params });
  }

  unreadCount(): Observable<number> {
    return this.http.get<{count:number}>(`${this.base}/unread-count`).pipe(map(r => r.count));
  }

  markRead(id: number): Observable<NotificationPayload> {
    return this.http.post<NotificationPayload>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<number> {
    return this.http.post<{updated:number}>(`${this.base}/read-all`, {}).pipe(map(r => r.updated));
  }

  deleteOne(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  deleteAll(): Observable<number> {
    return this.http.delete<{deleted:number}>(this.base).pipe(map(r => r.deleted));
  }
}
