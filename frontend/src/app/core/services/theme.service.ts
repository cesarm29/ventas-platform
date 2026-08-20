import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly darkMode = signal(true);
  readonly darkMode$ = new BehaviorSubject<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      const isDark = saved ? saved === 'dark' : true;
      this.darkMode.set(isDark);
      this.darkMode$.next(isDark);
      this.applyTheme();

      effect(() => {
        const dark = this.darkMode();
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        this.darkMode$.next(dark);
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
