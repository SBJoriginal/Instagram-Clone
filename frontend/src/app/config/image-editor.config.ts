/**
 * Configuration for Image Editor Dialog
 * These settings are used when opening the ImageFilterDialogComponent
 */
export const IMAGE_EDITOR_DIALOG_CONFIG = {
  // Dialog dimensions
  width: '900px',
  maxWidth: '95vw',
  maxHeight: '95vh',

  // Export settings
  // Note: image/jpeg is hardcoded because the backend validation
  // relies on magic bytes detection, which works best with JPEG format.
  // Changing this may cause backend validation failures.
  mimeType: 'image/jpeg',
  quality: 0.9, // 90% quality for JPEG export
} as const;

/**
 * Available stickers for the image editor
 */
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
