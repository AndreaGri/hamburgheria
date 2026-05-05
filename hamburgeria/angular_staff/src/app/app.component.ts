// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="brand">
          <span class="brand-icon">🍔</span>
          <span class="brand-name">Staff Panel</span>
        </div>
        <a routerLink="/orders" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📋</span>
          <span>Ordini</span>
        </a>
        <a routerLink="/menu" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🗂️</span>
          <span>Menù</span>
        </a>
      </nav>
      <!-- Main content -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :host { display: block; height: 100vh; font-family: 'Outfit', sans-serif; }
    .app-shell { display: flex; height: 100vh; background: #111; color: #fff; }
    .sidebar { width: 200px; background: #1A1A1A; display: flex;
      flex-direction: column; padding: 20px 12px; border-right: 1px solid #2A2A2A;
      flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      margin-bottom: 24px; }
    .brand-icon { font-size: 24px; }
    .brand-name { font-weight: 800; font-size: 16px; color: #E63946; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px;
      border-radius: 10px; text-decoration: none; color: #999; font-weight: 600;
      font-size: 14px; margin-bottom: 4px; transition: all .2s; }
    .nav-item:hover { background: #2A2A2A; color: #fff; }
    .nav-item.active { background: #E6394620; color: #E63946; }
    .nav-icon { font-size: 18px; }
    .main-content { flex: 1; overflow-y: auto; }
  `]
})
export class AppComponent {}
