import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefDemandesComponent } from './chef-demandes.component';

describe('ChefDemandesComponent', () => {
  let component: ChefDemandesComponent;
  let fixture: ComponentFixture<ChefDemandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefDemandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefDemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
