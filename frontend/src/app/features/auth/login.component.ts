import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
          <h1 class="text-3xl font-bold text-dark-50 tracking-tight">VentasPlatform</h1>
          <p class="text-dark-400 mt-2">Sistema de gestion de ventas</p>
        </div>
        <div class="card">
          <h2 class="text-xl font-semibold text-dark-50 mb-6">{{ isLogin() ? 'Iniciar sesion' : 'Crear cuenta' }}</h2>
          @if (error$ | async; as error) {
            <div class="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-shake">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ error }}
            </div>
          }
          <form (ngSubmit)="onSubmit()" novalidate>
            <div class="space-y-4">
              @if (!isLogin()) {
                <div>
                  <label class="block text-sm font-medium text-dark-300 mb-1.5">Nombre completo</label>
                  <input type="text" [(ngModel)]="fullName" name="fullName"
                    class="input-field w-full" [class.!border-red-500]="touched() && nameError()"
                    [class.!ring-red-500/50]="touched() && nameError()"
                    placeholder="Tu nombre" (blur)="touched.set(true)" />
                  @if (touched() && nameError()) {
                    <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-slideDown">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {{ nameError() }}
                    </p>
                  }
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                <div class="relative">
                  <input type="email" [(ngModel)]="email" name="email"
                    class="input-field w-full !pl-10" [class.!border-red-500]="touched() && emailError()"
                    [class.!ring-red-500/50]="touched() && emailError()"
                    [class.!border-primary-500]="touched() && !emailError() && email.length > 0"
                    placeholder="admin&#64;ventas.com" (blur)="touched.set(true)" (input)="onEmailInput()" />
                  <div class="absolute left-3 top-1/2 -translate-y-1/2">
                    @if (touched() && email.length > 0 && !emailError()) {
                      <svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    } @else if (touched() && emailError()) {
                      <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    } @else {
                      <svg class="w-5 h-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                    }
                  </div>
                </div>
                @if (touched() && emailError()) {
                  <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-slideDown">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ emailError() }}
                  </p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Contrasena</label>
                <div class="relative">
                  <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="password" name="password"
                    class="input-field w-full !pl-10 !pr-10" [class.!border-red-500]="touched() && passwordError()"
                    [class.!ring-red-500/50]="touched() && passwordError()"
                    [class.!border-primary-500]="touched() && !passwordError() && password.length > 0"
                    placeholder="Minimo 6 caracteres" (blur)="touched.set(true)" (input)="onPasswordInput()" />
                  <div class="absolute left-3 top-1/2 -translate-y-1/2">
                    @if (touched() && password.length > 0 && !passwordError()) {
                      <svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    } @else if (touched() && passwordError()) {
                      <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    } @else {
                      <svg class="w-5 h-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    }
                  </div>
                  <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors">
                    @if (showPassword()) {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-5.197-5.197"/></svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                @if (touched() && passwordError()) {
                  <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-slideDown">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ passwordError() }}
                  </p>
                }
                @if (touched() && password.length > 0 && !isLogin()) {
                  <div class="mt-2 flex gap-1">
                    @for (i of [1,2,3,4]; track i) {
                      <div class="h-1 flex-1 rounded-full transition-colors duration-300"
                        [class.bg-red-500]="passwordStrength() >= i && passwordStrength() <= 1"
                        [class.bg-yellow-500]="passwordStrength() >= i && passwordStrength() === 2"
                        [class.bg-blue-400]="passwordStrength() >= i && passwordStrength() === 3"
                        [class.bg-primary-400]="passwordStrength() >= i && passwordStrength() >= 4"
                        [class.bg-dark-700]="passwordStrength() < i"></div>
                    }
                  </div>
                  <p class="mt-1 text-xs" [class]="strengthLabel().class">{{ strengthLabel().text }}</p>
                }
              </div>
              <button type="submit" class="btn-primary w-full relative overflow-hidden" [disabled]="loading$ | async">
                @if (loading$ | async) {
                  <span class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                }
                {{ isLogin() ? 'Ingresar' : 'Registrarse' }}
              </button>
            </div>
          </form>
          <div class="mt-4 text-center">
            <button (click)="toggleMode(); touched.set(false)" class="text-sm text-primary-400 hover:text-primary-300 transition-colors">
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
  touched = signal(false);
  showPassword = signal(false);

  emailError = signal('');
  passwordError = signal('');
  nameError = signal('');

  readonly passwordStrength = computed(() => {
    const p = this.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p) || /[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  });

  readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return { text: 'Debil', class: 'text-red-400' };
    if (s === 2) return { text: 'Regular', class: 'text-yellow-400' };
    if (s === 3) return { text: 'Buena', class: 'text-blue-400' };
    return { text: 'Excelente', class: 'text-primary-400' };
  });

  isLogin = () => this.loginMode;
  toggleMode() { this.loginMode = !this.loginMode; }

  onEmailInput() {
    const e = this.email.trim();
    if (!e) { this.emailError.set('El email es requerido'); }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { this.emailError.set('Formato de email invalido'); }
    else { this.emailError.set(''); }
  }

  onPasswordInput() {
    const p = this.password;
    if (!p) { this.passwordError.set('La contrasena es requerida'); }
    else if (p.length < 6) { this.passwordError.set('Minimo 6 caracteres'); }
    else { this.passwordError.set(''); }
  }

  onNameInput() {
    const n = this.fullName.trim();
    if (!n) { this.nameError.set('El nombre es requerido'); }
    else if (n.length < 2) { this.nameError.set('Minimo 2 caracteres'); }
    else { this.nameError.set(''); }
  }

  onSubmit() {
    this.touched.set(true);
    this.onEmailInput();
    this.onPasswordInput();
    if (!this.loginMode) this.onNameInput();
    if (this.emailError() || this.passwordError() || (!this.loginMode && this.nameError())) return;

    if (this.loginMode) {
      this.store.dispatch(AuthActions.login({ credentials: { email: this.email, password: this.password } }));
    } else {
      this.store.dispatch(AuthActions.register({ data: { fullName: this.fullName, email: this.email, password: this.password } }));
    }
  }
}
