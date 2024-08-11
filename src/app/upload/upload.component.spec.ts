import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProfileComponent } from './upload.component';

describe('NewProfileComponent', () => {
  let component: NewProfileComponent;
  let fixture: ComponentFixture<NewProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
