import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import emojiData from '../../../assets/emoji.json';
import { Emoji } from '../../../types/emoji';

@Component({
  selector: 'app-icon-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icon-panel.component.html',
  styleUrl: './icon-panel.component.css'
})
export class IconPanelComponent implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  searchResults: any[] = [];
  searchTerm: string = '';

  copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  applySearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if(!term) {
      this.filteredCategories = this.categories.map(cat=>({
        ...cat,
        filtered: cat.emojis
      }));
      this.searchResults = [];
      return;
    }

    this.filteredCategories = this.categories.map(cat=>({
      ...cat,
      filtered: cat.emojis.filter((emoji: Emoji)=>
        emoji.name.toLowerCase().includes(term) ||
        emoji.emoji.toLowerCase().includes(term) ||
        emoji.code.toLowerCase().includes(term)
      )
    })).filter(cat=>cat.filtered.length > 0);

    this.searchResults = this.filteredCategories.flatMap(cat=>cat.filtered);
  }

  ngOnInit() {
    this.categories = (emojiData as any).categories;
    this.filteredCategories = this.categories.map(cat=>({
      ...cat,
      filtered: cat.emojis
    }))
  }
}
