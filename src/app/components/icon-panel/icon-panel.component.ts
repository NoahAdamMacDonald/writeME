import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import emojiData from '../../../assets/emoji.json';

@Component({
  selector: 'app-icon-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-panel.component.html',
  styleUrl: './icon-panel.component.css'
})
export class IconPanelComponent implements OnInit {
  categories: any[] = [];

  copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  ngOnInit() {
    this.categories = (emojiData as any).categories;
  }
}
