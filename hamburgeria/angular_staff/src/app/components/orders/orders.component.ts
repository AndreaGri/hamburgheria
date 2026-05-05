// src/app/components/orders/orders.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import {
  Order, OrderStatus,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS
} from '../../models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-page">
      <div class="page-header">
        <h1>🍔 Ordini in corso</h1>
        <div class="live-badge">● LIVE</div>
      </div>

      <!-- Filtro status -->
      <div class="filter-tabs">
        <button *ngFor="let s of statusList" class="tab"
          [class.active]="filterStatus === s.value"
          (click)="setFilter(s.value)">
          {{s.label}}
        </button>
      </div>

      <!-- Kanban board -->
      <div class="kanban">
        <div *ngFor="let col of columns" class="kanban-col">
          <div class="col-header" [style.borderColor]="col.color">
            <span class="col-title">{{col.label}}</span>
            <span class="col-count">{{getOrdersByStatus(col.status).length}}</span>
          </div>
          <div *ngFor="let order of getOrdersByStatus(col.status)" class="order-card">
            <div class="order-top">
              <span class="order-id">#{{order.id}}</span>
              <span class="order-name">{{order.customer_name}}</span>
              <span class="order-time">{{formatTime(order.created_at)}}</span>
            </div>
            <div class="order-items">
              <div *ngFor="let item of order.items" class="order-item">
                <span class="qty">{{item.quantity}}x</span>
                <span class="pname">{{item.product_name}}</span>
              </div>
            </div>
            <div *ngIf="order.notes" class="order-notes">📝 {{order.notes}}</div>
            <div class="order-footer">
              <span class="order-total">€{{order.total | number:'1.2-2'}}</span>
              <div class="actions">
                <button *ngFor="let ns of getNextStatuses(order.status)"
                  class="btn-status" [style.background]="getColor(ns)"
                  (click)="changeStatus(order, ns)">
                  {{getLabel(ns)}}
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="getOrdersByStatus(col.status).length === 0" class="empty-col">
            Nessun ordine
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-page { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; }
    .live-badge { background: #E63946; color: #fff; border-radius: 20px;
      padding: 4px 12px; font-size: 12px; font-weight: 700; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
    .filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab { padding: 8px 16px; border-radius: 20px; border: 1px solid #333;
      background: #1E1E1E; color: #999; cursor: pointer; font-size: 13px; }
    .tab.active { background: #E63946; color: #fff; border-color: #E63946; }
    .kanban { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .kanban-col { background: #1A1A1A; border-radius: 12px; padding: 16px; min-height: 200px; }
    .col-header { display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid; }
    .col-title { font-weight: 700; font-size: 14px; color: #fff; }
    .col-count { background: #2A2A2A; border-radius: 50%; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; }
    .order-card { background: #222; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
    .order-top { display: flex; gap: 8px; align-items: baseline; margin-bottom: 8px; }
    .order-id { font-weight: 800; color: #E63946; }
    .order-name { font-weight: 600; color: #fff; flex: 1; }
    .order-time { font-size: 11px; color: #666; }
    .order-item { font-size: 13px; color: #ccc; margin: 2px 0; }
    .qty { color: #F4A261; font-weight: 700; margin-right: 4px; }
    .pname { color: #eee; }
    .order-notes { font-size: 12px; color: #999; margin-top: 6px; font-style: italic; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .order-total { font-weight: 800; color: #F4A261; }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .btn-status { border: none; color: #fff; border-radius: 8px; padding: 5px 10px;
      font-size: 11px; font-weight: 700; cursor: pointer; }
    .empty-col { color: #444; font-size: 13px; text-align: center; margin-top: 20px; }
  `]
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filterStatus: OrderStatus | 'all' = 'all';
  private subs: Subscription[] = [];

  statusList = [
    { value: 'all' as const, label: 'Tutti' },
    { value: 'in_attesa' as OrderStatus, label: 'In attesa' },
    { value: 'in_preparazione' as OrderStatus, label: 'In preparazione' },
    { value: 'pronto' as OrderStatus, label: 'Pronto' },
    { value: 'consegnato' as OrderStatus, label: 'Consegnato' },
  ];

  columns = [
    { status: 'in_attesa' as OrderStatus, label: 'In attesa', color: '#F59E0B' },
    { status: 'in_preparazione' as OrderStatus, label: 'In preparazione', color: '#3B82F6' },
    { status: 'pronto' as OrderStatus, label: 'Pronto 🍔', color: '#10B981' },
    { status: 'consegnato' as OrderStatus, label: 'Consegnato', color: '#6B7280' },
  ];

  nextStatusMap: Record<OrderStatus, OrderStatus[]> = {
    in_attesa: ['in_preparazione'],
    in_preparazione: ['pronto'],
    pronto: ['consegnato'],
    consegnato: [],
  };

  constructor(private api: ApiService, private socket: SocketService) {}

  ngOnInit() {
    this.loadOrders();
    this.subs.push(
      this.socket.onOrderNew.subscribe(() => this.loadOrders()),
      this.socket.onOrderUpdated.subscribe(() => this.loadOrders()),
    );
  }

  loadOrders() {
    this.api.getOrders().subscribe(o => this.orders = o);
  }

  setFilter(s: OrderStatus | 'all') { this.filterStatus = s; }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(o =>
      o.status === status &&
      (this.filterStatus === 'all' || this.filterStatus === status)
    );
  }

  changeStatus(order: Order, status: OrderStatus) {
    this.api.updateOrderStatus(order.id, status).subscribe(() => this.loadOrders());
  }

  getNextStatuses(status: OrderStatus): OrderStatus[] {
    return this.nextStatusMap[status] ?? [];
  }

  getLabel(s: OrderStatus) { return ORDER_STATUS_LABELS[s]; }
  getColor(s: OrderStatus) { return ORDER_STATUS_COLORS[s]; }

  formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
