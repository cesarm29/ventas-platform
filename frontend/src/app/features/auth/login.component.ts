import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-primary-900/20 p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/10 border border-primary-500/20 mb-4">
            <svg class="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">VentasPlatform</h1>
          <p class="text-dark-400 mt-2">Sistema de gestion de ventas</p>
        </div>
        <div class="card">
          <h2 class="text-xl font-semibold text-white mb-6">{{ isLogin() ? 'Iniciar sesion' : 'Crear cuenta' }}</h2>
          @if (error$ | async; as error) {
            <div class="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>
          }
          <form (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              @if (!isLogin()) {
                <div>
                  <label class="block text-sm font-medium text-dark-300 mb-1.5">Nombre completo</label>
                  <input type="text" [(ngModel)]="fullName" name="fullName" class="input-field" placeholder="Tu nombre" required />
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                <input type="email" [(ngModel)]="email" name="email" class="input-field" placeholder="admin&#64;ventas.com" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Contrasena</label>
                <input type="password" [(ngModel)]="password" name="password" class="input-field" placeholder="Minimo 6 caracteres" required />
              </div>
              <button type="submit" class="btn-primary w-full" [disabled]="loading$ | async">
                @if (loading$ | async) {
                  <span class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                }
                {{ isLogin() ? 'Ingresar' : 'Registrarse' }}
              </button>
            </div>
          </form>
          <div class="mt-4 text-center">
            <button (click)="toggleMode()" class="text-sm text-primary-400 hover:text-primary-300">
              {{ isLogin() ? 'No tienes cuenta? Registrate' : 'Ya tienes cuenta? Inicia sesion' }}
            </button>
          </div>
          <div class="mt-4 pt-4 border-t border-dark-700/50 text-center">
            <p class="text-dark-400 text-xs">Demo: admin&#64;ventas.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly store = inject(Store);
  email = ''; password = ''; fullName = '';
  private loginMode = true;

  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);

  isLogin = () => this.loginMode;
  toggleMode() { this.loginMode = !this.loginMode; }

  onSubmit() {
    if (this.email && this.password) {
      if (this.loginMode) {
        this.store.dispatch(AuthActions.login({ credentials: { email: this.email, password: this.password } }));
      } else {
        this.store.dispatch(AuthActions.register({ data: { fullName: this.fullName, email: this.email, password: this.password } }));
      }
    }
  }
}
