import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesEtSoldeComponent } from './demandes-et-solde.component';

describe('DemandesEtSoldeComponent', () => {
  let component: DemandesEtSoldeComponent;
  let fixture: ComponentFixture<DemandesEtSoldeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesEtSoldeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesEtSoldeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
