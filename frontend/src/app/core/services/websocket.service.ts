import { Injectable, NgZone, inject } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private productSubject = new Subject<any>();
  private orderSubject = new Subject<any>();
  private zone = inject(NgZone);
  private attempts = 0;
  private maxAttempts = 3;

  readonly productNotifications$ = this.productSubject.asObservable();
  readonly orderNotifications$ = this.orderSubject.asObservable();

  connect(): void {
    if (environment.production) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        this.attempts = 0;
        this.client?.subscribe('/topic/products', (msg: IMessage) => {
          this.zone.run(() => this.productSubject.next(JSON.parse(msg.body)));
        });
        this.client?.subscribe('/topic/orders', (msg: IMessage) => {
          this.zone.run(() => this.orderSubject.next(JSON.parse(msg.body)));
        });
      },
      onStompError: () => {
        this.attempts++;
        if (this.attempts >= this.maxAttempts) {
          this.client?.deactivate();
        }
      }
    });
    this.client.activate();
  }

  disconnect(): void { this.client?.deactivate(); }
}
