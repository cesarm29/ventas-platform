import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthEmail, selectAuthRole, selectAuthName } from '../../store/auth/auth.selectors';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex bg-dark-950">
      @if (sidebarOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }
      <aside class="fixed lg:static inset-y-0 left-0 z-40 w-72 bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 flex flex-col transition-transform duration-300"
        [ngClass]="{'translate-x-0': sidebarOpen(), '-translate-x-full': !sidebarOpen(), 'lg:translate-x-0': true}">
        <div class="p-6 border-b border-dark-700/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-white">VentasPlatform</h1>
              <p class="text-xs text-dark-400">v1.0.0</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/home" routerLinkActive="active" class="sidebar-link" (click)="sidebarOpen.set(false)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/products" routerLinkActive="active" class="sidebar-link" (click)="sidebarOpen.set(false)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span>Productos</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="sidebar-link" (click)="sidebarOpen.set(false)">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span>Ventas</span>
          </a>
        </nav>
        <div class="p-4 border-t border-dark-700/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary-600/10 flex items-center justify-center">
              <span class="text-primary-400 text-sm font-semibold">{{ (name$ | async)?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ name$ | async }}</p>
              <p class="text-xs text-dark-400">{{ role$ | async }}</p>
            </div>
            <button (click)="logout()" class="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-red-400 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>
      </aside>
      <div class="flex-1 flex flex-col min-h-screen">
        <header class="sticky top-0 z-20 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 flex items-center px-4 lg:px-6 gap-4">
          <button (click)="sidebarOpen.set(!sidebarOpen())" class="lg:hidden p-2 rounded-xl hover:bg-dark-700/50 text-dark-400">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div class="flex-1"></div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span class="text-xs text-dark-400">En linea</span>
          </div>
        </header>
        <main class="flex-1 p-4 lg:p-6"><router-outlet /></main>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);
  private readonly ws = inject(WebSocketService);
  sidebarOpen = signal(false);
  readonly email$ = this.store.select(selectAuthEmail);
  readonly role$ = this.store.select(selectAuthRole);
  readonly name$ = this.store.select(selectAuthName);
  private hydrated = false;

  ngOnInit() {
    if (!this.hydrated) {
      this.hydrated = true;
      const token = this.auth.getToken();
      if (token) {
        this.store.dispatch(AuthActions.hydrate({
          token,
          email: this.auth.getEmail() || '',
          fullName: this.auth.getFullName() || '',
          role: this.auth.getRole() || '',
        }));
      }
    }
    this.ws.connect();
  }
  ngOnDestroy() { this.ws.disconnect(); }
  logout() { this.store.dispatch(AuthActions.logout()); }
}
