import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private apiService: ApiService, private userService: UserService) {}

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get isLoggedInSync(): boolean {
    return this.loggedIn.value;
  }

  register(username: string, password: string): Observable<any> {
    return this.apiService.post('register', { username, password })
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(error.error || 'Server error');
        })
      );
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.post('login', { username, password })
      .pipe(
        catchError(error => {
          console.error('Login error:', error);
          return throwError(error.error || 'Server error');
        })
      );
  }

  handleLoginResponse(response: any): void {
    if (response && response.username) {
      localStorage.setItem('username', response.username);
      this.loggedIn.next(true);
      this.userService.setUsername(response.username);
    }
  }

  logout(): void {
    localStorage.removeItem('username');
    this.loggedIn.next(false);
    this.userService.setUsername(null);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('username');
  }
}