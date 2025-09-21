import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueDemandesChefComponent } from './historique-demandes-chef.component';

describe('HistoriqueDemandesChefComponent', () => {
  let component: HistoriqueDemandesChefComponent;
  let fixture: ComponentFixture<HistoriqueDemandesChefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueDemandesChefComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueDemandesChefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
