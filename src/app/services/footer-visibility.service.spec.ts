import { TestBed } from '@angular/core/testing';

import { FooterVisibilityService } from './footer-visibility.service';

describe('FooterVisibilityService', () => {
  let service: FooterVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FooterVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
