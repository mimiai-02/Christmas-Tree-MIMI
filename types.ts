export enum OrnamentType {
  GOLD = 'GOLD',
  RUBY = 'RUBY',
  EMERALD = 'EMERALD',
  DIAMOND = 'DIAMOND',
  KITTY = 'KITTY',
  GIFT = 'GIFT',
  LIGHT = 'LIGHT',
  PHOTO = 'PHOTO'
}

export type TreeState = 'CHAOS' | 'FORMED';

export interface OrnamentData {
  id: string;
  position: [number, number, number]; // Formed position
  chaosPosition: [number, number, number]; // Chaos position
  type: OrnamentType;
  scale: number;
}

export interface FortuneResponse {
  message: string;
  theme: string;
}