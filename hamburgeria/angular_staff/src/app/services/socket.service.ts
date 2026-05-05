// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private orderNew$ = new Subject<any>();
  private orderUpdated$ = new Subject<any>();
  private menuUpdated$ = new Subject<any>();

  constructor() {
    this.socket = io(environment.socketUrl, { transports: ['websocket'] });

    this.socket.on('connect', () =>
      console.log('✅ Staff WebSocket connesso')
    );
    this.socket.on('order_new', (data) => this.orderNew$.next(data));
    this.socket.on('order_updated', (data) => this.orderUpdated$.next(data));
    this.socket.on('menu_updated', (data) => this.menuUpdated$.next(data));
  }

  get onOrderNew(): Observable<any> { return this.orderNew$.asObservable(); }
  get onOrderUpdated(): Observable<any> { return this.orderUpdated$.asObservable(); }
  get onMenuUpdated(): Observable<any> { return this.menuUpdated$.asObservable(); }

  disconnect() { this.socket.disconnect(); }
}
