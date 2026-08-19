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

  readonly productNotifications$ = this.productSubject.asObservable();
  readonly orderNotifications$ = this.orderSubject.asObservable();

  connect(): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        this.client?.subscribe('/topic/products', (msg: IMessage) => {
          this.zone.run(() => this.productSubject.next(JSON.parse(msg.body)));
        });
        this.client?.subscribe('/topic/orders', (msg: IMessage) => {
          this.zone.run(() => this.orderSubject.next(JSON.parse(msg.body)));
        });
      }
    });
    this.client.activate();
  }

  disconnect(): void { this.client?.deactivate(); }
}
