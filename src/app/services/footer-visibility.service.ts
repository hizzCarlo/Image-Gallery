import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FooterVisibilityService {
  private footerVisible = new BehaviorSubject<boolean>(true);
  footerVisible$ = this.footerVisible.asObservable();

  setFooterVisible(visible: boolean) {
    this.footerVisible.next(visible);
  }
}