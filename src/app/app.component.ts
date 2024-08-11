import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'formalytics';
  hideHeader: boolean = false;
  hideFooter: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.hideHeader = this.shouldHideHeader(event.urlAfterRedirects);

      }
    });
  }

  shouldHideHeader(url: string): boolean {
    const hideHeaderRoutes = ['/gallery'];
    return hideHeaderRoutes.some(route => url.startsWith(route));
  }

  
}
