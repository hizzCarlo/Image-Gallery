import { Component, OnInit } from '@angular/core';
import { FooterVisibilityService } from '../services/footer-visibility.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  footerVisible$ = this.footerVisibilityService.footerVisible$;

  constructor(private footerVisibilityService: FooterVisibilityService) {}

  ngOnInit(): void {}
}