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
      console.log('[Theme] localStorage:', saved);
      const isDark = saved ? saved === 'dark' : true;
      this.darkMode.set(isDark);
      this.darkMode$.next(isDark);
      this.applyTheme();

      effect(() => {
        const dark = this.darkMode();
        console.log('[Theme] effect fired, dark:', dark, 'classes:', document.documentElement.className);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        this.darkMode$.next(dark);
        this.applyTheme();
        console.log('[Theme] after apply, classes:', document.documentElement.className);
      });
    }
  }

  toggle() {
    console.log('[Theme] toggle called, current:', this.darkMode());
    this.darkMode.update(v => !v);
    console.log('[Theme] after toggle:', this.darkMode());
  }

  private applyTheme() {
    if (this.darkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
