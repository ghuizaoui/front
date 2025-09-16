import { TestBed } from '@angular/core/testing';

import { WsNotificationService } from './ws-notification.service';

describe('WsNotificationService', () => {
  let service: WsNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
