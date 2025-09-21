import { TestBed } from '@angular/core/testing';

import { DashboardChefService } from './dashboard-chef.service';

describe('DashboardChefService', () => {
  let service: DashboardChefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardChefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
