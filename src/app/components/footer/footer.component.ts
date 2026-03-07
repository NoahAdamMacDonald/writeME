import { Component, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  isDarkMode = true;


  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDarkMode = saved === 'dark' || (!saved && prefersDark);

    this.applyTheme();
    this.applyHighlightTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  private applyHighlightTheme() {
    const link = document.getElementById('hljs-theme') as HTMLLinkElement;

    if(link) {
      link.href = this.isDarkMode ? 'assets/hljs/github-dark.css' : 'assets/hljs/github.css';
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');

    this.applyTheme();
    this.applyHighlightTheme();
  }
}
