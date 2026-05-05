// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderStatus, Product } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Prodotti ─────────────────────────────────────────────────────

  getMenu(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/menu`);
  }

  addProduct(product: Partial<Product>): Observable<any> {
    return this.http.post(`${this.base}/menu`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<any> {
    return this.http.put(`${this.base}/menu/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.base}/menu/${id}`);
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<any[]>(`${this.base}/categories`);
  }

  // ── Ordini ───────────────────────────────────────────────────────

  getOrders(status?: OrderStatus): Observable<Order[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Order[]>(`${this.base}/orders${params}`);
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<any> {
    return this.http.patch(`${this.base}/orders/${id}/status`, { status });
  }
}
