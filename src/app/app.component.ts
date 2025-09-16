import {Component, OnInit} from '@angular/core';

import {RouterOutlet} from '@angular/router';
import {WsNotificationService} from './services/WsNotification/ws-notification.service';
@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private ws: WsNotificationService) {}
  ngOnInit() { this.ws.ensureConnected(); }
}
