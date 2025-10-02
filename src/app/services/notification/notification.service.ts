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

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byCategory?: {
    [category: string]: number;
  };
}

export interface NotificationFilter {
  statut?: NotifStatut;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  // Basic listing with pagination
  list(page = 0, size = 10, statut?: NotifStatut): Observable<NotificationPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) params = params.set('statut', statut);
    return this.http.get<NotificationPage>(this.base, { params });
  }

  // Advanced filtering for DRH and other roles
  listWithFilters(
    page = 0, 
    size = 10, 
    filters?: NotificationFilter
  ): Observable<NotificationPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      if (filters.statut) params = params.set('statut', filters.statut);
      if (filters.category) params = params.set('categorie', filters.category);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<NotificationPage>(`${this.base}/filter`, { params });
  }

  // Get notifications by demand type (useful for DRH)
  listByDemandType(type: string, page = 0, size = 10): Observable<NotificationPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('typeDemande', type);

    return this.http.get<NotificationPage>(`${this.base}/by-type`, { params });
  }

  // Get notifications by category (CONGE_STANDARD, AUTORISATION, etc.)
  listByCategory(category: string, page = 0, size = 10): Observable<NotificationPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('categorie', category);

    return this.http.get<NotificationPage>(`${this.base}/by-category`, { params });
  }

  // Get detailed statistics (useful for DRH dashboard)
  getStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.base}/stats`);
  }

  // Get statistics for a specific period
  getStatsByPeriod(startDate: string, endDate: string): Observable<NotificationStats> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<NotificationStats>(`${this.base}/stats/period`, { params });
  }

  // Unread count with optional filters
  unreadCount(filters?: { category?: string; type?: string }): Observable<number> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('categorie', filters.category);
    if (filters?.type) params = params.set('type', filters.type);

    return this.http.get<{count: number}>(`${this.base}/unread-count`, { params })
      .pipe(map(r => r.count));
  }

  // Mark single notification as read
  markRead(id: number): Observable<NotificationPayload> {
    return this.http.post<NotificationPayload>(`${this.base}/${id}/read`, {});
  }

  // Mark multiple notifications as read
  markMultipleRead(ids: number[]): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.base}/read-multiple`, { ids });
  }

  // Mark all notifications as read (with optional filters)
  markAllRead(filters?: { category?: string; type?: string }): Observable<number> {
    let body: any = {};
    if (filters) {
      if (filters.category) body.category = filters.category;
      if (filters.type) body.type = filters.type;
    }

    return this.http.post<{updated: number}>(`${this.base}/read-all`, body)
      .pipe(map(r => r.updated));
  }

  // Delete single notification
  deleteOne(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Delete multiple notifications
  deleteMultiple(ids: number[]): Observable<{ deleted: number }> {
    return this.http.post<{ deleted: number }>(`${this.base}/delete-multiple`, { ids });
  }

  // Delete all notifications (with optional filters)
  deleteAll(filters?: { category?: string; type?: string }): Observable<number> {
    let body: any = {};
    if (filters) {
      if (filters.category) body.category = filters.category;
      if (filters.type) body.type = filters.type;
    }

    return this.http.post<{deleted: number}>(`${this.base}/delete-all`, body)
      .pipe(map(r => r.deleted));
  }

  // Get notifications that require DRH attention
  getDrhAttentionNotifications(page = 0, size = 10): Observable<NotificationPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<NotificationPage>(`${this.base}/drh/attention`, { params });
  }

  // Get notifications for specific service (useful for DRH overseeing multiple services)
  getByService(service: string, page = 0, size = 10): Observable<NotificationPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('service', service);

    return this.http.get<NotificationPage>(`${this.base}/by-service`, { params });
  }

  // Quick actions for DRH - bulk operations
  bulkAction(ids: number[], action: 'read' | 'unread' | 'delete'): Observable<{ processed: number }> {
    return this.http.post<{ processed: number }>(`${this.base}/bulk-action`, {
      ids,
      action
    });
  }

  // Search notifications by content
  search(query: string, page = 0, size = 10): Observable<NotificationPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('q', query);

    return this.http.get<NotificationPage>(`${this.base}/search`, { params });
  }

  // Get notification history for a specific demand
  getByDemandId(demandId: number): Observable<NotificationPayload[]> {
    return this.http.get<NotificationPayload[]>(`${this.base}/demand/${demandId}`);
  }

  // Subscribe to real-time notifications (WebSocket)
  getNotificationStream(): Observable<NotificationPayload> {
    return new Observable(observer => {
      // This would typically connect to a WebSocket endpoint
      // For now, we'll return an empty observable that can be extended
      // You would integrate with your WsNotificationService here
      observer.complete();
    });
  }
}