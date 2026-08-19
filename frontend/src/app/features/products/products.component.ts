import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Product } from '../../core/models/api.models';
import { ProductActions } from '../../store/products/products.actions';
import { selectAllProducts, selectProductLoading, selectProductPageInfo } from '../../store/products/products.selectors';
import { WebSocketService } from '../../core/services/websocket.service';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Productos</h1>
          <p class="text-dark-400 mt-1">Catalogo de productos</p>
        </div>
        <button (click)="showForm.set(true)" class="btn-primary flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Nuevo producto
        </button>
      </div>
      <div class="card">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" class="input-field" placeholder="Buscar producto..." />
          </div>
          <select [(ngModel)]="selectedCategory" (ngModelChange)="onCategory($event)" class="input-field sm:w-48">
            <option value="">Todas las categorias</option>
            <option value="Electronica">Electronica</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Muebles">Muebles</option>
          </select>
        </div>
      </div>
      <div class="card p-0 overflow-hidden">
        <div class="ag-theme-alpine-dark" style="height: 500px; width: 100%;">
          <ag-grid-angular class="w-full h-full"
            [rowData]="products()" [columnDefs]="columnDefs" [defaultColDef]="defaultColDef"
            [pagination]="true" [paginationPageSize]="20" [paginationPageSizeSelector]="[10,20,50]"
            [animateRows]="true" [loading]="loading()"
            (gridReady)="onGridReady($event)" />
        </div>
      </div>
      @if (pageInfo(); as pi) {
        <div class="flex items-center justify-between text-sm text-dark-400">
          <span>{{ pi.totalElements }} productos</span>
          <span>Pagina {{ pi.page + 1 }} de {{ pi.totalPages }}</span>
        </div>
      }
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeForm()">
          <div class="card w-full max-w-lg" (click)="$event.stopPropagation()">
            <h2 class="text-xl font-semibold text-white mb-6">Nuevo producto</h2>
            <form (ngSubmit)="saveProduct()">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm text-dark-300 mb-1">Nombre</label>
                  <input [(ngModel)]="formData.name" name="name" class="input-field" required />
                </div>
                <div>
                  <label class="block text-sm text-dark-300 mb-1">Categoria</label>
                  <input [(ngModel)]="formData.category" name="category" class="input-field" required />
                </div>
                <div>
                  <label class="block text-sm text-dark-300 mb-1">Precio</label>
                  <input type="number" [(ngModel)]="formData.price" name="price" class="input-field" required />
                </div>
                <div>
                  <label class="block text-sm text-dark-300 mb-1">Stock</label>
                  <input type="number" [(ngModel)]="formData.stock" name="stock" class="input-field" required />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm text-dark-300 mb-1">Descripcion</label>
                  <textarea [(ngModel)]="formData.description" name="description" class="input-field" rows="2"></textarea>
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
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();
  private gridApi!: GridApi;

  products = signal<Product[]>([]);
  loading = signal(false);
  pageInfo = signal<any>(null);
  showForm = signal(false);
  searchTerm = '';
  selectedCategory = '';
  formData: Product = { id: null, name: '', description: '', category: '', price: 0, stock: 0, active: true };

  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Producto', flex: 1, minWidth: 200, filter: 'agTextColumnFilter' },
    { field: 'category', headerName: 'Categoria', width: 140, filter: 'agSetColumnFilter' },
    { field: 'price', headerName: 'Precio', width: 130, filter: 'agNumberColumnFilter', cellRenderer: (p: any) => `$${p.value?.toLocaleString()}` },
    { field: 'stock', headerName: 'Stock', width: 100, filter: 'agNumberColumnFilter', cellStyle: (p: any) => ({ color: p.value < 20 ? '#f87171' : '#4ade80' }) },
    { field: 'active', headerName: 'Estado', width: 100, cellRenderer: (p: any) => p.value ? '<span class="text-green-400">Activo</span>' : '<span class="text-red-400">Inactivo</span>' },
  ];

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: true, floatingFilter: true };

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts({ page: 0, size: 20 }));

    this.search$.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(s => this.store.dispatch(ProductActions.loadProducts({ page: 0, size: 20, search: s, category: this.selectedCategory })));

    this.store.select(selectAllProducts).pipe(takeUntil(this.destroy$)).subscribe(p => { this.products.set(p); this.cdr.markForCheck(); });
    this.store.select(selectProductLoading).pipe(takeUntil(this.destroy$)).subscribe(l => { this.loading.set(l); this.cdr.markForCheck(); });
    this.store.select(selectProductPageInfo).pipe(takeUntil(this.destroy$)).subscribe(i => { this.pageInfo.set(i); this.cdr.markForCheck(); });

    this.ws.productNotifications$.pipe(takeUntil(this.destroy$)).subscribe(n => {
      this.store.dispatch(ProductActions.realtimeNotification({ event: n.event, product: n.product }));
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onGridReady(params: GridReadyEvent) { this.gridApi = params.api; }
  onSearch(v: string) { this.search$.next(v); }
  onCategory(c: string) { this.store.dispatch(ProductActions.loadProducts({ page: 0, size: 20, search: this.searchTerm, category: c })); }

  saveProduct() {
    this.store.dispatch(ProductActions.createProduct({ product: this.formData }));
    this.closeForm();
  }

  closeForm() { this.showForm.set(false); this.formData = { id: null, name: '', description: '', category: '', price: 0, stock: 0, active: true }; }
}
