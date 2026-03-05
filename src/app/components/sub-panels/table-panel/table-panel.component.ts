import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EditorStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-table-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-panel.component.html',
  styleUrl: './table-panel.component.css',
})
export class TablePanelComponent implements OnInit {
  editor = inject(EditorStateService);

  rows: string[][] = [
    ['', ''],
    ['', ''],
  ];

  alignments: ('left' | 'center' | 'right')[] = ['left', 'left'];

  selectedColumnForSwap: number | null = null;
  selectedRowForSwap: number | null = null;

  showWarning = false;
  warningMessage = '';

  editing = false;
  originalStart = 0;
  originalEnd = 0;

  private showError(msg: string) {
    this.warningMessage = msg;
    this.showWarning = true;
    setTimeout(() => (this.showWarning = false), 2000);
  }

  trackByIndex(index: number) {
    return index;
  }

  toggleAlignment(col: number) {
    const order = ['left', 'center', 'right'] as const;
    const current = this.alignments[col];
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.alignments[col] = next;
  }

  addColumn() {
    this.rows.forEach((r) => r.push(''));
    this.alignments.push('left');
  }

  removeColumn() {
    if (this.rows[0].length > 1) {
      this.rows.forEach((r) => r.pop());
      this.alignments.pop();
    }
  }

  addRow() {
    this.rows.push(Array(this.rows[0].length).fill(''));
  }

  removeRow() {
    if (this.rows.length > 1) {
      this.rows.pop();
    }
  }

  selectColumn(col: number) {
    if (this.selectedColumnForSwap === null) {
      this.selectedColumnForSwap = col;
    } else {
      const a = this.selectedColumnForSwap;
      const b = col;

      this.rows.forEach((r) => {
        const tmp = r[a];
        r[a] = r[b];
        r[b] = tmp;
      });

      const tmpAlign = this.alignments[a];
      this.alignments[a] = this.alignments[b];
      this.alignments[b] = tmpAlign;

      this.selectedColumnForSwap = null;
    }
  }

  selectRow(row: number) {
    if (this.selectedRowForSwap === null) {
      this.selectedRowForSwap = row;
    } else {
      const a = this.selectedRowForSwap;
      const b = row;

      const tmp = this.rows[a];
      this.rows[a] = this.rows[b];
      this.rows[b] = tmp;

      this.selectedRowForSwap = null;
    }
  }

  buildTable(): string {
    const header = this.rows[0];
    const body = this.rows.slice(1);

    const alignRow = this.alignments.map((a) => {
      if (a === 'left') return ':---';
      if (a === 'center') return ':---:';
      return '---:';
    });

    const lines = [
      `| ${header.join(' | ')} |`,
      `| ${alignRow.join(' | ')} |`,
      ...body.map((r) => `| ${r.join(' | ')} |`),
    ];

    return lines.join('\n') + '\n';
  }

  //New Table
  insert() {
    if (!this.validate()) return;

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


  //Existing Table
  save() {
    if (!this.validate()) return;

    const table = this.buildTable();

    this.editor.applyMarkdown(() => {
      const content = this.editor.content;

      const newContent =
        content.slice(0, this.originalStart) +
        table +
        content.slice(this.originalEnd);

      const newStart = this.originalStart + table.length;

      return { newContent, newStart, newEnd: newStart };
    });

    this.editor.setSidebarTab('edit');
  }

  deleteExistingBlock() {
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

  private loadExistingTable() {
    const content = this.editor.content;
    const cursor = this.editor.selectionStart;

    const lines = content.split('\n');

    let cursorLineIndex = 0;
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1;
      if (charCount > cursor) {
        cursorLineIndex = i;
        break;
      }
    }

    //Helper Functions
    const isTableLine = (line: string) =>
      line.trim().startsWith('|') && line.trim().endsWith('|');

    if (!isTableLine(lines[cursorLineIndex])) {
      return;
    }

    let startLine = cursorLineIndex;
    while (startLine > 0 && isTableLine(lines[startLine - 1])) {
      startLine--;
    }

    let endLine = cursorLineIndex;
    while (endLine < lines.length - 1 && isTableLine(lines[endLine + 1])) {
      endLine++;
    }

    const tableLines = lines.slice(startLine, endLine + 1);

    if (tableLines.length < 2) return;

    const header = tableLines[0];
    const align = tableLines[1];

    if (!header.includes('|') || !align.includes('|')) return;

    const clean = (cells: string[]) => {
      while (cells.length && cells[cells.length - 1] === '') {
        cells.pop();
      }
      return cells;
    };

    const headerCells = clean(
      header
        .split('|')
        .slice(1, -1)
        .map((s) => s.trim()),
    );

    const alignCells = clean(
      align
        .split('|')
        .slice(1, -1)
        .map((s) => s.trim()),
    );

    const alignmentMap: Record<string, 'left' | 'center' | 'right'> = {
      ':---': 'left',
      ':---:': 'center',
      '---:': 'right',
    };

    this.alignments = alignCells.map((a) => alignmentMap[a] || 'left');

    const bodyRows: string[][] = [];

    for (let i = 2; i < tableLines.length; i++) {
      const row = tableLines[i];
      if (!row.includes('|')) break;

      const cells = clean(
        row
          .split('|')
          .slice(1, -1)
          .map((s) => s.trim()),
      );

      if (cells.length) bodyRows.push(cells);
    }

    this.rows = [headerCells, ...bodyRows];

    let startOffset = 0;
    for (let i = 0; i < startLine; i++) {
      startOffset += lines[i].length + 1;
    }

    let endOffset = startOffset;
    for (let i = startLine; i <= endLine; i++) {
      endOffset += lines[i].length + 1;
    }

    this.originalStart = startOffset;
    this.originalEnd = endOffset;

    this.editing = true;
  }

  private validate() : boolean {
  const allCells = this.rows.flat();

  const hasContent = allCells.some(cell => cell.trim().length > 0);

  if (!hasContent) {
    this.showError('Table cannot be empty');
    return false;
  }

  return true;

  }

  ngOnInit() {
    this.loadExistingTable();
  }
}
