import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorisationComponent } from './autorisation.component';

describe('AutorisationComponent', () => {
  let component: AutorisationComponent;
  let fixture: ComponentFixture<AutorisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutorisationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutorisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
