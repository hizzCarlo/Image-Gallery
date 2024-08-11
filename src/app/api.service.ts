import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost/api/';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: { headers?: HttpHeaders, params?: HttpParams, responseType?: any }): Observable<T> {
    const headers = this.createHeaders(options?.headers);
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { ...options, headers })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.createHeaders(new HttpHeaders({ 'Content-Type': 'application/json' }));
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.createHeaders(new HttpHeaders({ 'Content-Type': 'application/json' }));
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers, body: data })
      .pipe(catchError(this.handleError));
  }
  
  uploadImageWithID(data: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}` // Replace with your actual token retrieval method
    });

    return this.http.post(`${this.apiUrl}upload-image-with-id`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  getUniqueID(username: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`, // Replace with your actual token retrieval method
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}get_unique_id`, { username }, { headers })
      .pipe(catchError(this.handleError));
  }

  private getAuthToken(): string {
    // Replace with your actual auth token retrieval method
    return localStorage.getItem('auth_token') || '';
  }

  private createHeaders(existingHeaders?: HttpHeaders): HttpHeaders {
    let headers = existingHeaders || new HttpHeaders();
    const authToken = localStorage.getItem('auth_token'); // Replace with your actual auth token retrieval method
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }
    return headers;
  }

  private handleError(error: any) {
    console.error('API error:', error);
    return throwError(error.error || 'Server error');
  }
}