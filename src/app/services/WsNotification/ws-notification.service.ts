// src/app/services/WsNotification/ws-notification.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationPayload } from '../../models/NotificationPayload';
import SockJS from 'sockjs-client';

type CanonicalType =
  | 'DEMANDE_CREATED'
  | 'DEMANDE_VALIDATED'
  | 'DEMANDE_REFUSED'
  | 'DEMANDE_UPDATED';

@Injectable({ providedIn: 'root' })
export class WsNotificationService implements OnDestroy {
  private client?: Client;
  private sub?: StompSubscription;
  private connecting = false;

  // Messages temps réel
  public incoming$ = new Subject<NotificationPayload>();
  // Statut de connexion
  public connected$ = new BehaviorSubject<boolean>(false);

  /** Idempotent : ne (re)connecte que si nécessaire */
  ensureConnected(token?: string) {
    if (this.client?.active || this.connecting) return;
    const t = token || localStorage.getItem('access_token') || '';
    this.connect(t);
  }

  /** Mappe toute valeur fournie par le back vers un type canonique EN */
  private normalizeType(t: unknown): CanonicalType {
    const s = String(t || '').toUpperCase().trim();
    switch (s) {
      case 'DEMANDE_VALIDEE':    return 'DEMANDE_VALIDATED';
      case 'DEMANDE_REFUSEE':    return 'DEMANDE_REFUSED';
      case 'DEMANDE_CREATED':
      case 'DEMANDE_VALIDATED':
      case 'DEMANDE_REFUSED':
      case 'DEMANDE_UPDATED':    return s as CanonicalType;
      default:                   return 'DEMANDE_UPDATED';
    }
  }

  /** Tronque les microsecondes et force un fuseau pour une parsabilité fiable */
  private normalizeIsoDate(v: unknown): string | null {
    if (!v) return null;
    const s = String(v);
    // .ffffff -> .fff
    const trimmed = s.replace(/(\.\d{3})\d+$/, '$1');
    // ajoute 'Z' si pas de fuseau
    return /Z$|[+-]\d{2}:\d{2}$/.test(trimmed) ? trimmed : trimmed + 'Z';
  }

  /** Connexion brute avec JWT */
  connect(token: string) {
    if (this.client?.active || this.connecting) return;
    this.connecting = true;

    const url = token
      ? `${environment.wsBase}?token=${encodeURIComponent(token)}`
      : environment.wsBase;

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      reconnectDelay: 5000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        this.connected$.next(true);
        this.connecting = false;

        try { this.sub?.unsubscribe(); } catch {}
        this.sub = this.client!.subscribe('/user/queue/notifications', (msg: IMessage) => {
          try {
            const raw = JSON.parse(msg.body) as Partial<NotificationPayload> & { type?: unknown };
            const payload: NotificationPayload = {
              id: Number(raw.id),
              demandeId: raw.demandeId ?? null,
              type: this.normalizeType(raw.type),
              subject: raw.subject ?? '',
              message: raw.message ?? '',
              statut: (raw.statut === 'LU' ? 'LU' : 'NON_LU'),
              dateCreation: this.normalizeIsoDate(raw.dateCreation) ?? new Date().toISOString(),
              dateValidation: this.normalizeIsoDate(raw.dateValidation) ?? null,
              motifRefus: raw.motifRefus ?? null,
              categorie: raw.categorie ?? null,
              typeDemande: raw.typeDemande ?? null,
              auteurMatricule: raw.auteurMatricule ?? null,
              destinataire: raw.destinataire ?? null,
            };
            this.incoming$.next(payload);
          } catch (e) {
            console.error('WS parse error', e, msg.body);
          }
        });
      },

      onStompError: frame => {
        console.warn('STOMP error', frame.headers['message'], frame.body);
        this.connected$.next(false);
        this.connecting = false;
      },

      onWebSocketClose: () => {
        this.connected$.next(false);
        this.connecting = false;
      }
    });

    this.client.activate();
  }

  disconnect() {
    try { this.sub?.unsubscribe(); } catch {}
    try { this.client?.deactivate(); } catch {}
    this.client = undefined;
    this.connecting = false;
    this.connected$.next(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
