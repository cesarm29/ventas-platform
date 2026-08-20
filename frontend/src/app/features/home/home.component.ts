import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ProductActions } from '../../store/products/products.actions';
import { OrderActions } from '../../store/orders/orders.actions';
import { selectAllProducts } from '../../store/products/products.selectors';
import { selectAllOrders } from '../../store/orders/orders.selectors';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-dark-50">Dashboard</h1>
        <p class="text-dark-400 mt-1">Resumen general del sistema</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats; track stat.label) {
          <div class="card group hover:border-primary-500/30 transition-all duration-300">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-dark-400 text-sm">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-dark-50 mt-1">{{ stat.value }}</p>
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-dark-50 mb-4">Tendencia de Ventas</h2>
          <div style="height: 280px;">
            <canvas baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              [type]="'line'">
            </canvas>
          </div>
        </div>
        <div class="card">
          <h2 class="text-lg font-semibold text-dark-50 mb-4">Estado de Ordenes</h2>
          <div style="height: 280px;">
            <canvas baseChart
              [data]="doughnutChartData"
              [options]="doughnutChartOptions"
              [type]="'doughnut'">
            </canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-dark-50 mb-4">Productos por Categoria</h2>
          <div style="height: 280px;">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>
        <div class="card">
          <h2 class="text-lg font-semibold text-dark-50 mb-4">Ventas Recientes</h2>
          <div class="space-y-3 max-h-[280px] overflow-y-auto">
            @for (order of recentOrders; track order.id) {
              <div class="flex items-center gap-4 p-3 rounded-xl bg-dark-700/30">
                <div class="w-2 h-2 rounded-full" [ngClass]="{
                  'bg-yellow-400': order.status === 'PENDING',
                  'bg-blue-400': order.status === 'CONFIRMED',
                  'bg-purple-400': order.status === 'SHIPPED',
                  'bg-blue-300': order.status === 'DELIVERED',
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
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly theme = inject(ThemeService);

  readonly orders$ = this.store.select(selectAllOrders);
  recentOrders: any[] = [];

  stats = [
    { label: 'Productos', value: '0', sub: 'En catalogo', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconBg: 'bg-primary-600/10', iconColor: 'text-primary-400' },
    { label: 'Ventas totales', value: '0', sub: 'Este mes', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-green-600/10', iconColor: 'text-blue-400' },
    { label: 'Pendientes', value: '0', sub: 'Por confirmar', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: 'bg-amber-600/10', iconColor: 'text-amber-400' },
    { label: 'Categorias', value: '0', sub: 'Activas', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', iconBg: 'bg-purple-600/10', iconColor: 'text-purple-400' },
  ];

  lineChartData: ChartData<'line'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      data: [65, 59, 80, 81, 56, 55],
      label: 'Ventas',
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#8b5cf6',
    }]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = this.getLineOptions();
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = this.getDoughnutOptions();

  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#facc15', '#3b82f6', '#a855f7', '#3b82f6', '#ef4444'],
      borderWidth: 0,
    }]
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Productos',
      backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'],
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = this.getBarOptions();

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts({ page: 0, size: 100 }));
    this.store.dispatch(OrderActions.loadOrders({ page: 0, size: 10 }));

    this.store.select(selectAllOrders).subscribe(orders => {
      this.recentOrders = orders.slice(0, 5);
      const pending = orders.filter(o => o.status === 'PENDING').length;
      const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
      const shipped = orders.filter(o => o.status === 'SHIPPED').length;
      const delivered = orders.filter(o => o.status === 'DELIVERED').length;
      const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
      this.doughnutChartData = {
        ...this.doughnutChartData,
        datasets: [{ ...this.doughnutChartData.datasets[0], data: [pending, confirmed, shipped, delivered, cancelled] }]
      };
      this.stats[1] = { ...this.stats[1], value: orders.length.toString() };
      this.stats[2] = { ...this.stats[2], value: pending.toString() };
      this.cdr.markForCheck();
    });

    this.store.select(selectAllProducts).subscribe(products => {
      const cats = products.reduce((acc: Record<string, number>, p: any) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});
      const labels = Object.keys(cats);
      const data = Object.values(cats) as number[];
      this.barChartData = {
        labels,
        datasets: [{ ...this.barChartData.datasets[0], data, backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'].slice(0, labels.length) }]
      };
      this.stats[0] = { ...this.stats[0], value: products.length.toString() };
      this.stats[3] = { ...this.stats[3], value: labels.length.toString() };
      this.cdr.markForCheck();
    });
  }

  private getGridColor() { return this.theme.darkMode() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'; }
  private getTickColor() { return this.theme.darkMode() ? '#6b7280' : '#475569'; }

  private getLineOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: this.getGridColor() }, ticks: { color: this.getTickColor() } },
        y: { grid: { color: this.getGridColor() }, ticks: { color: this.getTickColor() } }
      }
    };
  }

  private getDoughnutOptions(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: this.getTickColor(), padding: 12, usePointStyle: true } } },
      cutout: '65%',
    };
  }

  private getBarOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: this.getTickColor() } },
        y: { grid: { color: this.getGridColor() }, ticks: { color: this.getTickColor() } }
      }
    };
  }
}
