import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ProductActions } from '../../store/products/products.actions';
import { OrderActions } from '../../store/orders/orders.actions';
import { selectAllProducts } from '../../store/products/products.selectors';
import { selectAllOrders } from '../../store/orders/orders.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <p class="text-dark-400 mt-1">Resumen general del sistema</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats; track stat.label) {
          <div class="card group hover:border-primary-500/30 transition-all duration-300">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-dark-400 text-sm">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-white mt-1">{{ stat.value }}</p>
              </div>
              <div [class]="stat.iconBg" class="w-10 h-10 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5" [class]="stat.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="stat.icon"/>
                </svg>
              </div>
            </div>
            <div class="mt-4 text-sm text-dark-500">{{ stat.sub }}</div>
          </div>
        }
      </div>
      <div class="card">
        <h2 class="text-lg font-semibold text-white mb-4">Ventas recientes</h2>
        <div class="space-y-3">
          @for (order of (orders$ | async)?.slice(0, 5); track order.id) {
            <div class="flex items-center gap-4 p-3 rounded-xl bg-dark-700/30">
              <div class="w-2 h-2 rounded-full" [ngClass]="{
                'bg-yellow-400': order.status === 'PENDING',
                'bg-blue-400': order.status === 'CONFIRMED',
                'bg-purple-400': order.status === 'SHIPPED',
                'bg-green-400': order.status === 'DELIVERED',
                'bg-red-400': order.status === 'CANCELLED'
              }"></div>
              <div class="flex-1">
                <p class="text-sm text-dark-200">{{ order.clientName }} - \${{ order.total }}</p>
                <p class="text-xs text-dark-500">{{ order.status }}</p>
              </div>
            </div>
          } @empty {
            <p class="text-dark-500 text-sm text-center py-4">No hay ventas registradas</p>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly store = inject(Store);
  readonly orders$ = this.store.select(selectAllOrders);

  stats = [
    { label: 'Productos', value: '--', sub: 'En catalogo', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconBg: 'bg-primary-600/10', iconColor: 'text-primary-400' },
    { label: 'Ventas totales', value: '--', sub: 'This month', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-green-600/10', iconColor: 'text-green-400' },
    { label: 'Pendientes', value: '--', sub: 'Por confirmar', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-600/10', iconColor: 'text-amber-400' },
    { label: 'Categorias', value: '5', sub: 'Activas', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', iconBg: 'bg-purple-600/10', iconColor: 'text-purple-400' },
  ];

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts({ page: 0, size: 100 }));
    this.store.dispatch(OrderActions.loadOrders({ page: 0, size: 10 }));
  }
}
