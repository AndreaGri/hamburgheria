// src/app/components/menu-manager/menu-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/models';

@Component({
  selector: 'app-menu-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-page">
      <div class="page-header">
        <h1>🗂️ Gestione Menù</h1>
        <button class="btn-add" (click)="openForm()">+ Aggiungi prodotto</button>
      </div>

      <!-- Filtro categorie -->
      <div class="filter-tabs">
        <button class="tab" [class.active]="!filterCat" (click)="filterCat=''">Tutti</button>
        <button *ngFor="let cat of categories" class="tab"
          [class.active]="filterCat === cat"
          (click)="filterCat = cat">
          {{cat | titlecase}}
        </button>
      </div>

      <!-- Grid prodotti -->
      <div class="products-grid">
        <div *ngFor="let p of filteredProducts" class="product-card"
          [class.unavailable]="!p.available">
          <img *ngIf="p.image_url" [src]="p.image_url" alt="{{p.name}}" class="product-img"/>
          <div *ngIf="!p.image_url" class="product-img-placeholder">🍔</div>
          <div class="product-info">
            <div class="product-top">
              <span class="product-name">{{p.name}}</span>
              <span class="product-cat">{{p.category}}</span>
            </div>
            <p class="product-desc">{{p.description}}</p>
            <div class="product-footer">
              <span class="product-price">€{{p.price | number:'1.2-2'}}</span>
              <span class="avail-badge" [class.avail]="p.available">
                {{p.available ? 'Disponibile' : 'Non disp.'}}
              </span>
            </div>
            <div class="product-actions">
              <button class="btn-edit" (click)="openForm(p)">✏️ Modifica</button>
              <button class="btn-toggle" (click)="toggleAvail(p)">
                {{p.available ? '🔴 Disattiva' : '🟢 Attiva'}}
              </button>
              <button class="btn-delete" (click)="deleteProduct(p.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal form -->
      <div *ngIf="showForm" class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{editingProduct ? 'Modifica prodotto' : 'Nuovo prodotto'}}</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome *</label>
              <input [(ngModel)]="form.name" placeholder="Es. Cheeseburger"/>
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select [(ngModel)]="form.category">
                <option *ngFor="let c of categories" [value]="c">{{c | titlecase}}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Prezzo (€) *</label>
              <input type="number" step="0.10" [(ngModel)]="form.price" placeholder="0.00"/>
            </div>
            <div class="form-group full">
              <label>Descrizione</label>
              <textarea [(ngModel)]="form.description" rows="2"
                placeholder="Ingredienti, note..."></textarea>
            </div>
            <div class="form-group full">
              <label>URL Immagine</label>
              <input [(ngModel)]="form.image_url" placeholder="https://..."/>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="closeForm()">Annulla</button>
            <button class="btn-save" (click)="saveProduct()">
              {{editingProduct ? 'Salva modifiche' : 'Aggiungi'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; }
    .btn-add { background: #E63946; color: #fff; border: none; border-radius: 10px;
      padding: 10px 20px; font-weight: 700; cursor: pointer; font-size: 14px; }
    .filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab { padding: 7px 16px; border-radius: 20px; border: 1px solid #333;
      background: #1E1E1E; color: #999; cursor: pointer; font-size: 13px; }
    .tab.active { background: #E63946; color: #fff; border-color: #E63946; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .product-card { background: #1E1E1E; border-radius: 14px; overflow: hidden;
      border: 1px solid #2A2A2A; transition: opacity .2s; }
    .product-card.unavailable { opacity: .5; }
    .product-img { width: 100%; height: 140px; object-fit: cover; }
    .product-img-placeholder { width: 100%; height: 140px; background: #2A2A2A;
      display: flex; align-items: center; justify-content: center; font-size: 40px; }
    .product-info { padding: 14px; }
    .product-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .product-name { font-weight: 700; color: #fff; font-size: 15px; }
    .product-cat { font-size: 11px; background: #2A2A2A; color: #aaa;
      padding: 2px 8px; border-radius: 10px; }
    .product-desc { font-size: 12px; color: #666; margin: 4px 0 8px; min-height: 16px; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .product-price { font-weight: 800; color: #F4A261; font-size: 16px; }
    .avail-badge { font-size: 11px; padding: 3px 8px; border-radius: 10px; background: #333; color: #999; }
    .avail-badge.avail { background: #10B98120; color: #10B981; }
    .product-actions { display: flex; gap: 6px; }
    .btn-edit, .btn-toggle, .btn-delete { border: none; border-radius: 8px; padding: 6px 10px;
      font-size: 12px; cursor: pointer; font-weight: 600; }
    .btn-edit { background: #2A2A2A; color: #ccc; }
    .btn-toggle { background: #2A2A2A; color: #ccc; flex: 1; }
    .btn-delete { background: #FF4C4C20; color: #FF4C4C; }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7);
      display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: #1E1E1E; border-radius: 16px; padding: 28px; width: 500px; max-width: 95vw; }
    .modal h2 { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full { grid-column: 1/-1; }
    .form-group label { font-size: 12px; color: #999; font-weight: 600; }
    .form-group input, .form-group select, .form-group textarea {
      background: #2A2A2A; border: 1px solid #333; border-radius: 8px;
      color: #fff; padding: 10px 12px; font-size: 14px; font-family: inherit; }
    .form-group textarea { resize: vertical; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-cancel { background: #2A2A2A; color: #999; border: none; border-radius: 10px;
      padding: 10px 20px; cursor: pointer; font-weight: 600; }
    .btn-save { background: #E63946; color: #fff; border: none; border-radius: 10px;
      padding: 10px 24px; cursor: pointer; font-weight: 700; }
  `]
})
export class MenuManagerComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  filterCat = '';
  showForm = false;
  editingProduct: Product | null = null;

  form: Partial<Product> = {
    name: '', description: '', price: 0, category: '', image_url: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getMenu().subscribe(p => this.products = p);
    this.api.getCategories().subscribe(cats => {
      this.categories = cats.map(c => c.name);
    });
  }

  get filteredProducts() {
    return this.filterCat
      ? this.products.filter(p => p.category === this.filterCat)
      : this.products;
  }

  openForm(product?: Product) {
    this.editingProduct = product ?? null;
    this.form = product
      ? { ...product }
      : { name: '', description: '', price: 0, category: this.categories[0] ?? '', image_url: '' };
    this.showForm = true;
  }

  closeForm() { this.showForm = false; this.editingProduct = null; }

  saveProduct() {
    if (!this.form.name || !this.form.category) return;
    const obs = this.editingProduct
      ? this.api.updateProduct(this.editingProduct.id, this.form)
      : this.api.addProduct(this.form);
    obs.subscribe(() => { this.loadData(); this.closeForm(); });
  }

  toggleAvail(p: Product) {
    this.api.updateProduct(p.id, { available: !p.available }).subscribe(() => this.loadData());
  }

  deleteProduct(id: number) {
    if (!confirm('Eliminare questo prodotto?')) return;
    this.api.deleteProduct(id).subscribe(() => this.loadData());
  }
}
