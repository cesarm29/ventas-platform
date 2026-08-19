import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { Order } from '../../core/models/api.models';
import { OrderActions } from '../../store/orders/orders.actions';
import { selectAllOrders, selectOrderLoading, selectOrderPageInfo } from '../../store/orders/orders.selectors';
import { WebSocketService } from '../../core/services/websocket.service';
import { ApiService } from '../../core/services/api.service';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Ventas</h1>
          <p class="text-dark-400 mt-1">Gestion de ordenes de venta</p>
        </div>
      </div>
      <div class="card">
        <select [(ngModel)]="selectedStatus" (ngModelChange)="onStatusChange($event)" class="input-field sm:w-48">
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>
      <div class="card p-0 overflow-hidden">
        <div class="ag-theme-alpine-dark" style="height: 500px; width: 100%;">
          <ag-grid-angular class="w-full h-full"
            [rowData]="orders()" [columnDefs]="columnDefs" [defaultColDef]="defaultColDef"
            [pagination]="true" [paginationPageSize]="20"
            [animateRows]="true" [loading]="loading()"
            (gridReady)="onGridReady($event)" />
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ws = inject(WebSocketService);
  private readonly api = inject(ApiService);
  private readonly destroy$ = new Subject<void>();
  private gridApi!: GridApi;

  orders = signal<Order[]>([]);
  loading = signal(false);
  selectedStatus = '';

  columnDefs: ColDef[] = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'clientName', headerName: 'Cliente', flex: 1, minWidth: 150 },
    { field: 'clientEmail', headerName: 'Email', width: 200 },
    { field: 'total', headerName: 'Total', width: 120, cellRenderer: (p: any) => `$${p.value?.toLocaleString()}` },
    { field: 'status', headerName: 'Estado', width: 130, cellRenderer: (p: any) => {
      const colors: Record<string, string> = { PENDING: 'text-yellow-400', CONFIRMED: 'text-blue-400', SHIPPED: 'text-purple-400', DELIVERED: 'text-green-400', CANCELLED: 'text-red-400' };
      return `<span class="${colors[p.value] || ''}">${p.value}</span>`;
    }},
    { field: 'createdAt', headerName: 'Fecha', width: 180, valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : '' },
  ];

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: true };

  ngOnInit(): void {
    this.store.dispatch(OrderActions.loadOrders({ page: 0, size: 20 }));
    this.store.select(selectAllOrders).pipe(takeUntil(this.destroy$)).subscribe(o => { this.orders.set(o); this.cdr.markForCheck(); });
    this.store.select(selectOrderLoading).pipe(takeUntil(this.destroy$)).subscribe(l => { this.loading.set(l); this.cdr.markForCheck(); });
    this.ws.orderNotifications$.pipe(takeUntil(this.destroy$)).subscribe(n => {
      this.store.dispatch(OrderActions.realtimeNotification({ event: n.event, order: n.order }));
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  onGridReady(params: GridReadyEvent) { this.gridApi = params.api; }

  onStatusChange(status: string) {
    this.store.dispatch(OrderActions.loadOrders({ page: 0, size: 20, status: status || undefined }));
  }
}
