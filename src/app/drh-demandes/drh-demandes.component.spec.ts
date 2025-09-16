import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrhDemandesComponent } from './drh-demandes.component';

describe('DrhDemandesComponent', () => {
  let component: DrhDemandesComponent;
  let fixture: ComponentFixture<DrhDemandesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrhDemandesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrhDemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
