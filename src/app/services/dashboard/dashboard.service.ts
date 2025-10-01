import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:9091/api/dashboard';

  constructor(private http: HttpClient) {}

  //  Overview
  getOverview(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/overview`, { params });
  }

  // Status distribution
  getStatusDistribution(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/status-distribution`, { params });
  }

  //  Leave balance global
  getLeaveBalance(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/leave-balance`, { params });
  }

  //  Leave by service
  getLeaveByService(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/leave-by-service`, { params });
  }

  //  Accepted requests
  getAcceptedRequests(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/accepted-requests`, { params });
  }

  //  Employee leave balance by service
  getEmployeeLeaveBalance(service: string, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('service', service)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/employee-leave-balance`, { params });
  }


  getCategoryTypeDistribution(startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<any>(`${this.apiUrl}/category-type-distribution`, { params });
  }
}
