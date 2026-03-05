import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import emojiData from '../../assets/emoji.json';


@Injectable({ providedIn: 'root' })
export class EditorStateService {
  private contentSubject = new BehaviorSubject<string>('');

  sidebarTab = signal<'file' | 'edit' | 'icons' | 'foldable' | 'link-url' | 'link-section' | 'code-block' | 'table'>('file');

  //Map for emoji conversion
  private codeToEmoji = new Map<string, string>();
  private emojiToCode = new Map<string, string>();

  content$ = this.contentSubject.asObservable();

  content = '';

  selectionStart = 0;
  selectionEnd = 0;

  cursorLine = 1;
  lastKnownLine = 1;

  //Editor handler
  setContent(value: string) {
    this.content = value;
    this.contentSubject.next(value);
    localStorage.setItem('editorContent', value);
  }

  updateSelection(start: number, end: number) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }

  updateCursorLine(line: number) {
    this.cursorLine = line;
    this.lastKnownLine = line;
  }

  applyMarkdown(
    transform: (
      content: string,
      start: number,
      end: number,
    ) => { newContent: string; newStart: number; newEnd: number },
  ) {
    const { newContent, newStart, newEnd } = transform(
      this.content,
      this.selectionStart,
      this.selectionEnd,
    );

    this.setContent(newContent);
    this.selectionStart = newStart;
    this.selectionEnd = newEnd;
  }

  //Emoji conversion
  convertEmojiToCode(text: string) {
    let result = text;

    for (const [emoji, code] of this.emojiToCode.entries()) {
      result = result.split(emoji).join(code);
    }
    return result;
  }

  convertCodeToEmoji(text: string) {
    let result = text;

    for (const [code, emoji] of this.codeToEmoji.entries()) {
      result = result.split(code).join(emoji);
    }
    return result;
  }

  //Panel handler
  setSidebarTab(tab: 'file' | 'edit' | 'icons' | 'foldable' | 'link-url' | 'link-section' | 'code-block' | 'table') {
    this.sidebarTab.set(tab);
  }

  constructor() {
    const categories = (emojiData as any).categories;

    for (const cat of categories) {
      for (const emoji of cat.emojis) {
        this.codeToEmoji.set(emoji.code, emoji.emoji);
        this.emojiToCode.set(emoji.emoji, emoji.code);
      }
    }

    const saved = localStorage.getItem('editorContent');

    if (saved) {
      this.content = saved;
      this.contentSubject.next(saved);
    }
  }
}
