import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private theme: Theme = 'dark';

  constructor() {
    this.loadTheme();
    this.applyTheme();
    this.applyHighlightTheme();
  }


  //Theme
  get isDarkMode(): boolean {
    return this.theme === 'dark';
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);

    this.applyTheme();
    this.applyHighlightTheme();
  }

  private loadTheme() {
    const saved = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    this.theme = saved ?? (prefersDark ? 'dark' : 'light');
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.theme === 'dark');
  }

  private applyHighlightTheme() {
    const link = document.getElementById(
      'hljs-theme',
    ) as HTMLLinkElement | null;

    if (link) {
      link.href =
        this.theme === 'dark'
          ? 'assets/hljs/github-dark.css'
          : 'assets/hljs/github.css';
    }
  }

  //Editor Highlighting
  get editorHighlighting(): boolean {
    return this.getSetting('editorHighlighting', true);
  }

  set editorHighlighting(value: boolean) {
    this.setSetting('editorHighlighting', value);
  }

  // Setting functions
  setSetting<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getSetting<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }
}
