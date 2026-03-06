export interface Hotkey {
  name: string;
  symbol: string;
  aliases?: string[];
}

export interface HotkeyGroup {
  category: string;
  keys: Hotkey[];
}
