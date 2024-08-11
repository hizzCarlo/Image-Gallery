import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string | null = null;
  dropdownOpen: boolean = false;

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
      this.dropdownOpen = false; // Ensure dropdown is closed on login status change
    });
    this.userService.currentUsername.subscribe(name => this.username = name);
  }

  logout() {
    this.authService.logout();
    this.dropdownOpen = false; // Ensure dropdown is closed on logout
    this.router.navigate(['/']); // Redirect to homepage after logout
  }

  navigateBasedOnLogin() {
    if (this.isLoggedIn) {
      this.router.navigate(['/gallery']);
    } else {
      this.router.navigate(['/']);
    }
  }

  showDropdown() {
    this.dropdownOpen = true;
  }

  hideDropdown() {
    this.dropdownOpen = false;
  }
}