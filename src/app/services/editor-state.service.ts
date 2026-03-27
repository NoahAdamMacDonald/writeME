import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SidebarTab, SidebarTabs } from '../../types/sidebar-tab';

import emojiData from '../../assets/emoji.json';


@Injectable({ providedIn: 'root' })
export class EditorStateService {
  private contentSubject = new BehaviorSubject<string>('');

  sidebarTab = signal<SidebarTab>(SidebarTabs.File);

  //Map for emoji conversion
  private codeToEmoji = new Map<string, string>();
  private emojiToCode = new Map<string, string>();

  content$ = this.contentSubject.asObservable();

  content = '';

  //AI format content
  originalBeforeFormat: string | null = null;
  lastAiFormatted: string | null = null;

  selectionStart = 0;
  selectionEnd = 0;

  cursorLine = 1;
  lastKnownLine = 1;

  //Editor handler
  setContent(value: string, fromAI = false) {
    const isManual = !fromAI && value !== this.content;

    this.content = value;
    this.contentSubject.next(value);
    localStorage.setItem('editorContent', value);

    if (isManual) {
      this.originalBeforeFormat = null;
      this.lastAiFormatted = null;
    }
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
  setSidebarTab(tab: SidebarTab) {
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

  //AI Helpers
  saveOriginalBeforeFormat() {
    if (this.originalBeforeFormat === null) {
      this.originalBeforeFormat = this.content;
    }
  }

  saveLastAiFormatted(value: string) {
    this.lastAiFormatted = value;
  }

  revertToOriginal() {
    if (this.originalBeforeFormat !== null) {
      this.setContent(this.originalBeforeFormat, true);
      this.originalBeforeFormat = null;
      this.lastAiFormatted = null;
    }
  }
}
