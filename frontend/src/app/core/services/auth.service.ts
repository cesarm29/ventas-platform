import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'vp_token';
  private readonly emailKey = 'vp_email';
  private readonly roleKey = 'vp_role';
  private readonly nameKey = 'vp_name';

  readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
  readonly isAuthenticated = () => !!this.token();

  setSession(token: string, email: string, role: string, fullName: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.emailKey, email);
    localStorage.setItem(this.roleKey, role);
    localStorage.setItem(this.nameKey, fullName);
    this.token.set(token);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.nameKey);
    this.token.set(null);
  }

  getToken(): string | null { return this.token(); }
  getEmail(): string | null { return localStorage.getItem(this.emailKey); }
  getRole(): string | null { return localStorage.getItem(this.roleKey); }
  getFullName(): string | null { return localStorage.getItem(this.nameKey); }
}
