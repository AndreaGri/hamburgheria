// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { OrdersComponent } from './components/orders/orders.component';
import { MenuManagerComponent } from './components/menu-manager/menu-manager.component';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'orders', component: OrdersComponent },
  { path: 'menu', component: MenuManagerComponent },
];
