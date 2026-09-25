import { GlyphItem } from '../types';
import { GLYPH_PATHS } from './vectorPaths';

export const GLYPHS: GlyphItem[] = [
  { id: 'glyph-word-w', char: 'W', group: 'WORD', path: GLYPH_PATHS.wordW, bounds: '7.5 × 7.2 px' },
  { id: 'glyph-word-o', char: 'O', group: 'WORD', path: GLYPH_PATHS.wordO, bounds: '4.8 × 7.4 px' },
  { id: 'glyph-word-r', char: 'R', group: 'WORD', path: GLYPH_PATHS.wordR, bounds: '4.7 × 7.2 px' },
  { id: 'glyph-lord-l', char: 'L', group: 'LORD', path: GLYPH_PATHS.lordL, bounds: '4.2 × 7.2 px' },
  { id: 'glyph-lord-o', char: 'O', group: 'LORD', path: GLYPH_PATHS.lordO, bounds: '4.8 × 7.4 px' },
  { id: 'glyph-lord-r', char: 'R', group: 'LORD', path: GLYPH_PATHS.lordR, bounds: '4.7 × 7.2 px' },
  { id: 'glyph-ligature-d', char: 'TALL D', group: 'LIGATURE', path: GLYPH_PATHS.ligatureD, bounds: '4.8 × 15.6 px' },
  { id: 'glyph-media-m', char: 'M', group: 'MEDIA', path: GLYPH_PATHS.mediaM, bounds: '5.8 × 8.0 px' },
  { id: 'glyph-media-e', char: 'E', group: 'MEDIA', path: GLYPH_PATHS.mediaE, bounds: '3.8 × 8.0 px' },
  { id: 'glyph-media-d', char: 'D', group: 'MEDIA', path: GLYPH_PATHS.mediaD, bounds: '4.3 × 8.0 px' },
  { id: 'glyph-media-i', char: 'I', group: 'MEDIA', path: GLYPH_PATHS.mediaI, bounds: '1.4 × 8.0 px' },
  { id: 'glyph-media-a', char: 'A', group: 'MEDIA', path: GLYPH_PATHS.mediaA, bounds: '4.8 × 8.0 px' }
];
