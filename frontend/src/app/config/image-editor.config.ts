import Konva from 'konva';

// ─── Types ────────────────────────────────────────────────────────────────

type KonvaFilter = (imageData: ImageData) => void;

// ─── Stickers ─────────────────────────────────────────────────────────────

export const STICKERS = [
  { name: 'Smiley', url: '/assets/stickers/smiley.svg' },
  { name: 'Heart', url: '/assets/stickers/heart.svg' },
  { name: 'Rocket', url: '/assets/stickers/rocket.svg' },
  { name: 'Fire', url: '/assets/stickers/fire.svg' },
  { name: 'Pizza', url: '/assets/stickers/pizza.svg' },
  { name: 'Beer', url: '/assets/stickers/beer.svg' },
  { name: 'Cat', url: '/assets/stickers/cat.svg' },
  { name: 'Dog', url: '/assets/stickers/dog.svg' },
  { name: 'Christmas', url: '/assets/stickers/christmas.svg' },
  { name: 'Party', url: '/assets/stickers/party.svg' },
] as const;

// ─── Filters ──────────────────────────────────────────────────────────────

export interface FilterConfig {
  filters: KonvaFilter[];
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export const FILTERS: { name: string; value: string }[] = [
  { name: 'Normal', value: 'normal' },
  { name: 'Clarendon', value: 'clarendon' },
  { name: 'Moon', value: 'moon' },
  { name: 'Sepia', value: 'sepia' },
  { name: 'Invert', value: 'invert' },
  { name: 'Solarize', value: 'solarize' },
  { name: 'Reyes', value: 'reyes' },
  { name: 'Juno', value: 'juno' },
  { name: 'Lark', value: 'lark' },
];

export const FILTER_CONFIGS: Record<string, FilterConfig> = {
  clarendon: {
    filters: [Konva.Filters.Brighten, Konva.Filters.Contrast] as KonvaFilter[],
    brightness: 0.1,
    contrast: 20,
  },
  moon: {
    filters: [Konva.Filters.Grayscale, Konva.Filters.Contrast] as KonvaFilter[],
    contrast: 10,
  },
  sepia: {
    filters: [Konva.Filters.Sepia] as KonvaFilter[],
  },
  invert: {
    filters: [Konva.Filters.Invert] as KonvaFilter[],
  },
  solarize: {
    filters: [Konva.Filters.Solarize] as KonvaFilter[],
  },
  reyes: {
    filters: [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL] as KonvaFilter[],
    brightness: 0.2,
    contrast: -10,
    saturation: -0.2,
  },
  juno: {
    filters: [Konva.Filters.Brighten, Konva.Filters.HSL] as KonvaFilter[],
    brightness: 0.1,
    saturation: 0.3,
  },
  lark: {
    filters: [Konva.Filters.Brighten, Konva.Filters.Contrast] as KonvaFilter[],
    brightness: 0.05,
    contrast: 10,
  },
};

// ─── Frames ───────────────────────────────────────────────────────────────

export const FRAMES: { name: string; value: string }[] = [
  { name: 'None', value: 'none' },
  { name: 'Polaroid', value: 'polaroid' },
  { name: 'Gold', value: 'gold' },
  { name: 'Hearts', value: 'hearts' },
  { name: 'Dashed', value: 'dashed' },
  { name: 'Rainbow', value: 'rainbow' },
  { name: 'Neon', value: 'neon' },
  { name: 'Vintage', value: 'vintage' },
  { name: 'Film Strip', value: 'film' },
  { name: 'Vignette', value: 'vignette' },
  { name: 'Stars', value: 'stars' },
];

// ─── Dialog Config ────────────────────────────────────────────────────────

export const IMAGE_EDITOR_DIALOG_CONFIG = {
  width: '900px',
  maxWidth: '95vw',
  maxHeight: '95vh',
  mimeType: 'image/jpeg',
  quality: 0.9,
} as const;
