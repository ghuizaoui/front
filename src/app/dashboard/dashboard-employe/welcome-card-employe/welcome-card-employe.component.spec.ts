import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeCardEmployeComponent } from './welcome-card-employe.component';

describe('WelcomeCardEmployeComponent', () => {
  let component: WelcomeCardEmployeComponent;
  let fixture: ComponentFixture<WelcomeCardEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeCardEmployeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeCardEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
