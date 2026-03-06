export const SidebarTabs = {
  File: 'file',
  Edit: 'edit',
  Icons: 'icons',
  Foldable: 'foldable',
  LinkUrl: 'link-url',
  LinkSection: 'link-section',
  ImageEmbed: 'image-embed',
  YoutubeEmbed: 'youtube-embed',
  CodeBlock: 'code-block',
  Table: 'table',
  Hotkey: 'hotkey'
} as const;

export type SidebarTab = (typeof SidebarTabs)[keyof typeof SidebarTabs];
