import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly darkMode = signal(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      this.darkMode.set(saved ? saved === 'dark' : true);
      this.applyTheme();

      effect(() => {
        const isDark = this.darkMode();
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.applyTheme();
      });
    }
  }

  toggle() {
    this.darkMode.update(v => !v);
  }

  private applyTheme() {
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
