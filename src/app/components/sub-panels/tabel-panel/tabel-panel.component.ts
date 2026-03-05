import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-tabel-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabel-panel.component.html',
  styleUrl: './tabel-panel.component.css',
})
export class TabelPanelComponent {
  editor = inject(EditorStateService);

  rows = [
    ['', ''],
    ['', ''],
  ];

  alignments: ('left' | 'center' | 'right')[] = ['left', 'left'];

  selectedColumnForSwap: number | null = null;
  selectedRowForSwap: number | null = null;

  //Columns
  toggleAlignment(col: number) {
    const order = ['left', 'center', 'right'] as const;
    const current = this.alignments[col];
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.alignments[col] = next;
  }

  addColumn() {
    this.rows.forEach((row) => row.push(''));
    this.alignments.push('left');
  }

  removeColumn() {
    if (this.rows[0].length > 2) {
      this.rows.forEach((row) => row.pop());
      this.alignments.pop();
    }
  }

  selectColumn(col: number) {
    if (this.selectedColumnForSwap === null) {
      this.selectedColumnForSwap = col;
    } else {
      const a = this.selectedColumnForSwap;
      const b = col;

      this.rows.forEach((row) => {
        const temp = row[a];
        row[a] = row[b];
        row[b] = temp;
      });

      const tempAlign = this.alignments[a];
      this.alignments[a] = this.alignments[b];
      this.alignments[b] = tempAlign;

      this.selectedColumnForSwap = null;
    }
  }


  //Rows
  addRow() {
    this.rows.push(Array(this.rows[0].length).fill(''));
  }

  removeRow() {
    if (this.rows.length > 1) {
      this.rows.pop();
    }
  }

  selectRow(row: number) {
    if (this.selectedRowForSwap === null) {
      this.selectedRowForSwap = row;
    } else {
      const a = this.selectedRowForSwap;
      const b = row;

      const temp = this.rows[a];
      this.rows[a] = this.rows[b];
      this.rows[b] = temp;

      this.selectedRowForSwap = null;
    }
  }

  //Table Creation
  buildTable(): string {
    const header = this.rows[0];
    const body = this.rows.slice(1);

    const alignRow = this.alignments.map((alignment) => {
      if (alignment === 'left') return ':---';
      if (alignment === 'center') return ':---:';
      return '---:';
    });

    const lines = [
      `| ${header.join(' | ')} |`,
      `| ${alignRow.join(' | ')} |`,
      ...body.map((r) => `| ${r.join(' | ')} |`),
    ];

    return lines.join('\n') + '\n';
  }

  insert() {
    const table = this.buildTable();

    this.editor.applyMarkdown(() => {
      const content = this.editor.content;
      const start = this.editor.selectionStart;
      const end = this.editor.selectionEnd;

      const newContent = content.slice(0, start) + table + content.slice(end);
      const newStart = start + table.length;

      return { newContent, newStart, newEnd: newStart };
    });

    this.editor.setSidebarTab('edit');
  }
}
