import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeCongeExceptionnelComponent } from './demande-conge-exceptionnel.component';

describe('DemandeCongeExceptionnelComponent', () => {
  let component: DemandeCongeExceptionnelComponent;
  let fixture: ComponentFixture<DemandeCongeExceptionnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeCongeExceptionnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeCongeExceptionnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
