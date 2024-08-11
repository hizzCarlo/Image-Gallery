import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSource = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  private uniqueIDSource = new BehaviorSubject<string | null>(localStorage.getItem('unique_ID'));

  currentUsername = this.usernameSource.asObservable();
  currentUniqueID = this.uniqueIDSource.asObservable();

  constructor(private apiService: ApiService) {}

  setUsername(username: string | null) {
    this.usernameSource.next(username);
    if (username) {
      this.fetchUniqueID(username);
    }
  }

  setUniqueID(uniqueID: string | null) {
    this.uniqueIDSource.next(uniqueID);
    if (uniqueID) {
      localStorage.setItem('unique_ID', uniqueID);
    } else {
      localStorage.removeItem('unique_ID');
    }
  }

  private fetchUniqueID(username: string) {
    this.apiService.get<any>(`get_unique_id&username=${username}`, {
      // Add headers if needed for authentication
      // headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
    })
    .subscribe(response => {
      if (response.unique_ID) {
        this.setUniqueID(response.unique_ID);
      }
    }, error => {
      console.error('Failed to fetch unique ID:', error);
      if (error.status === 403) {
        console.error('Access forbidden: Check your permissions and authentication.');
      } else if (error.status === 404) {
        console.error('User not found.');
      } else if (error.status === 400) {
        console.error('Bad request: Username parameter is missing.');
      } else {
        console.error('An unexpected error occurred.');
      }
    });
  }

  login(username: string, password: string) {
    this.apiService.post<any>('login', { username, password })
      .subscribe(response => {
        if (response.message === 'Login successful') {
          localStorage.setItem('username', response.username);
          this.setUsername(response.username);
          this.setUniqueID(response.unique_ID);
        }
      }, error => {
        console.error('Login failed:', error);
      });
  }
}