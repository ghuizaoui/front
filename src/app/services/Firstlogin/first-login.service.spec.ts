import { TestBed } from '@angular/core/testing';

import { FirstLoginService } from './first-login.service';

describe('FirstLoginService', () => {
  let service: FirstLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirstLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
