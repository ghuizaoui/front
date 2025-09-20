import { TestBed } from '@angular/core/testing';

import { DashboardEmployeService } from './dashboard-employe.service';

describe('DashboardEmployeService', () => {
  let service: DashboardEmployeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardEmployeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
