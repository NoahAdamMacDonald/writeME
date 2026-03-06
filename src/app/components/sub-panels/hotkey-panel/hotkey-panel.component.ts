import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

import hotkeysData from '../../../../assets/hotkey.json';

interface HotkeySymbol {
  name: string;
  symbol: string;
}

@Component({
  selector: 'app-hotkey-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './hotkey-panel.component.html',
  styleUrl: './hotkey-panel.component.css',
})
export class HotkeyPanelComponent implements OnInit {
  editor = inject(EditorStateService);

  hotkeys: HotkeySymbol[] = hotkeysData;
  text = '';

  editing = false;
  originalStart = 0;
  originalEnd = 0;

  showWarning = false;
  warningMessage = '';

  private showError(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  private validate(): boolean {
    if (!this.text.trim()) {
      this.showError('Hotkey text cannot be empty');
      return false;
    }
    return true;
  }

  addSymbol(symbol: string) {
    this.text += symbol;
  }

  insert() {
    if (!this.validate()) return;

    const block = `<kbd>${this.text}</kbd>`;

    this.editor.applyMarkdown(() => {
      const content = this.editor.content;
      const start = this.editor.selectionStart;
      const end = this.editor.selectionEnd;

      const newContent = content.slice(0, start) + block + content.slice(end);
      const newStart = start + block.length;
      const newEnd = newStart;

      return { newContent, newStart, newEnd };
    });

    this.editor.setSidebarTab('edit');
  }

  loadExistingHotkey() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const start = content.lastIndexOf('<kbd>', cursor);
    const end = content.indexOf('</kbd>', start);

    if (start === -1 || end === -1) return;
    if (cursor < start || cursor > end + 6) return;

    const inside = content.slice(start + 5, end);

    this.text = inside;
    this.editing = true;
    this.originalStart = start;
    this.originalEnd = end + 6;
  }

  save() {
    if (!this.validate()) return;

    const block = `<kbd>${this.text}</kbd>`;

    this.editor.applyMarkdown(() => {
      const content = this.editor.content;

      const newContent =
        content.slice(0, this.originalStart) +
        block +
        content.slice(this.originalEnd);

      const newStart = this.originalStart + block.length;
      const newEnd = newStart;

      return { newContent, newStart, newEnd };
    });

    this.editor.setSidebarTab('edit');
  }

  deleteExistingHotkey() {
    this.editor.applyMarkdown(() => {
      const content = this.editor.content;

      const newContent =
        content.slice(0, this.originalStart) + content.slice(this.originalEnd);

      return {
        newContent,
        newStart: this.originalStart,
        newEnd: this.originalStart,
      };
    });

    this.editor.setSidebarTab('edit');
  }

  ngOnInit() {
    this.loadExistingHotkey();
  }
}
