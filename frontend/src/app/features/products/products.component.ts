import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../core/models/api.models';
import { ProductActions } from '../../store/products/products.actions';
import { selectAllProducts, selectProductLoading, selectProductPageInfo } from '../../store/products/products.selectors';
import { WebSocketService } from '../../core/services/websocket.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-dark-50">Productos</h1>
          <p class="text-dark-400 mt-1">Catalogo de productos</p>
        </div>
        <button (click)="showForm.set(true)" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Nuevo producto
        </button>
      </div>
      <div class="card p-0 overflow-x-hidden">
        @if (gridVisible) {
        <div class="ag-theme-alpine" [class.ag-theme-alpine-dark]="isDark"
          [ngStyle]="isDark ? darkGridVars : null"
          style="height: 500px; width: 100%;">
          <ag-grid-angular class="w-full h-full"
            [rowData]="products()" [columnDefs]="columnDefs" [defaultColDef]="defaultColDef"
            [pagination]="true" [paginationPageSize]="20" [paginationPageSizeSelector]="[10,20,50]"
            [animateRows]="true" [loading]="loading()"
            (gridReady)="onGridReady($event)" />
        </div>
        }
      </div>
      @if (pageInfo(); as pi) {
        <div class="flex items-center justify-between text-sm text-dark-400">
          <span>{{ pi.totalElements }} productos</span>
          <span>Pagina {{ pi.page + 1 }} de {{ pi.totalPages }}</span>
        </div>
      }
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" (click)="closeForm()">
          <div class="w-full max-w-lg bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-2xl" (click)="$event.stopPropagation()">
            <h2 class="text-xl font-semibold text-dark-50 mb-6">Nuevo producto</h2>
            <form (ngSubmit)="saveProduct()" #productForm="ngForm">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm text-dark-300 mb-1">Nombre</label>
                  <input type="text" [(ngModel)]="formData.name" name="name" class="input-field w-full"
                    [class.!border-red-500]="formTouched && !formData.name"
                    placeholder="Nombre del producto" (blur)="formTouched = true" required />
                  @if (formTouched && !formData.name) {
                    <p class="mt-1 text-xs text-red-400">El nombre es requerido</p>
                  }
                </div>
                <div>
                  <label class="block text-sm text-dark-300 mb-1">Categoria</label>
                  <select [(ngModel)]="formData.category" name="category" class="input-field w-full"
                    [class.!border-red-500]="formTouched && !formData.category"
                    (blur)="formTouched = true" required>
                    <option value="" disabled>Seleccionar</option>
                    <option value="Electronica">Electronica</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Muebles">Muebles</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Deportes">Deportes</option>
                  </select>
                  @if (formTouched && !formData.category) {
                    <p class="mt-1 text-xs text-red-400">Selecciona una categoria</p>
                  }
                </div>
                <div>
                  <label class="block text-sm text-dark-300 mb-1">Precio ($)</label>
                  <input type="number" [(ngModel)]="formData.price" name="price" class="input-field w-full"
                    [class.!border-red-500]="formTouched && (!formData.price || formData.price <= 0)"
                    placeholder="0.00" (blur)="formTouched = true" min="0.01" step="0.01" required />
                  @if (formTouched && (!formData.price || formData.price <= 0)) {
                    <p class="mt-1 text-xs text-red-400">Precio requerido mayor a 0</p>
                  }
                </div>
                <div>
                  <label class="block text-sm text-dark-300 mb-1">Stock</label>
                  <input type="number" [(ngModel)]="formData.stock" name="stock" class="input-field w-full"
                    [class.!border-red-500]="formTouched && (!formData.stock && formData.stock !== 0)"
                    placeholder="0" (blur)="formTouched = true" min="0" required />
                  @if (formTouched && (!formData.stock && formData.stock !== 0)) {
                    <p class="mt-1 text-xs text-red-400">Stock requerido</p>
                  }
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm text-dark-300 mb-1">Descripcion</label>
                  <textarea [(ngModel)]="formData.description" name="description" class="input-field w-full"
                    placeholder="Descripcion del producto..." rows="2"></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="closeForm()" class="btn-secondary">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ws = inject(WebSocketService);
  readonly theme = inject(ThemeService);
  private readonly destroy$ = new Subject<void>();
  private   gridApi!: GridApi;
  isDark = true;
  gridVisible = false;

  readonly darkGridVars: Record<string, string> = {
    '--ag-background-color': '#0f172a',
    '--ag-foreground-color': '#f8fafc',
    '--ag-border-color': '#1e3a5f',
    '--ag-header-background-color': '#1e293b',
    '--ag-header-foreground-color': '#e2e8f0',
    '--ag-odd-row-background-color': '#1e293b',
    '--ag-row-hover-color': 'rgba(59, 130, 246, 0.15)',
    '--ag-control-panel-background-color': '#1e293b',
    '--ag-alpine-active-color': '#3b82f6',
    '--ag-selected-row-background-color': 'rgba(59, 130, 246, 0.2)',
  };

  products = signal<Product[]>([]);
  loading = signal(false);
  pageInfo = signal<any>(null);
  showForm = signal(false);
  formData: Product = { id: null, name: '', description: '', category: '', price: 0, stock: 0, active: true };
  formTouched = false;

  constructor() {}

  get columnDefs(): ColDef[] {
    const stockOk = this.isDark ? '#93c5fd' : '#4ade80';
    const stockLow = '#f87171';
    const activo = this.isDark ? '#93c5fd' : '#4ade80';
    const activoClass = this.isDark ? 'text-blue-300' : 'text-green-400';
    const inactivoClass = 'text-red-400';
    return [
      { field: 'name', headerName: 'Producto', flex: 1, minWidth: 120, filter: 'agTextColumnFilter' },
      { field: 'price', headerName: 'Precio', width: 100, filter: 'agNumberColumnFilter', cellRenderer: (p: any) => `$${p.value?.toLocaleString()}` },
      { field: 'stock', headerName: 'Stock', width: 80, filter: 'agNumberColumnFilter', cellStyle: (p: any) => ({ color: p.value < 20 ? stockLow : stockOk }) },
      { field: 'active', headerName: 'Estado', width: 90, cellRenderer: (p: any) => p.value ? `<span class="${activoClass}">Activo</span>` : `<span class="${inactivoClass}">Inactivo</span>` },
    ];
  }

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: true, floatingFilter: true };

  ngOnInit(): void {
    setTimeout(() => this.gridVisible = true);

    this.theme.darkMode$.pipe(takeUntil(this.destroy$)).subscribe(d => {
      this.isDark = d;
      this.cdr.markForCheck();
    });

    this.store.dispatch(ProductActions.loadProducts({ page: 0, size: 20 }));

    this.store.select(selectAllProducts).pipe(takeUntil(this.destroy$)).subscribe(p => { this.products.set(p); this.cdr.markForCheck(); });
    this.store.select(selectProductLoading).pipe(takeUntil(this.destroy$)).subscribe(l => { this.loading.set(l); this.cdr.markForCheck(); });
    this.store.select(selectProductPageInfo).pipe(takeUntil(this.destroy$)).subscribe(i => { this.pageInfo.set(i); this.cdr.markForCheck(); });

    this.ws.productNotifications$.pipe(takeUntil(this.destroy$)).subscribe(n => {
      this.store.dispatch(ProductActions.realtimeNotification({ event: n.event, product: n.product }));
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onGridReady(params: GridReadyEvent) { this.gridApi = params.api; }

  saveProduct() {
    this.formTouched = true;
    if (!this.formData.name || !this.formData.category || !this.formData.price || this.formData.price <= 0) {
      return;
    }
    this.store.dispatch(ProductActions.createProduct({ product: this.formData }));
    this.closeForm();
  }

  closeForm() { this.showForm.set(false); this.formData = { id: null, name: '', description: '', category: '', price: 0, stock: 0, active: true }; }
}
