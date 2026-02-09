// Paleta Artiguista extraída del escudo institucional oficial
export const artiguistaColors = {
  azul: '#0047AB',      // Azul bandera de Artigas (círculo central)
  blanco: '#FFFFFF',    // Blanco institucional
  rojo: '#CE1126',      // Rojo bandera de Artigas
  dorado: '#D4AF37',    // Gallo central del escudo
  verde: '#228B22',     // Laureles con frutos rojos
  negro: '#1A1A1A',     // Texto institucional
  gris: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Variantes para gradientes y hover
  azulOscuro: '#003080',
  azulClaro: '#4A7FBF',
  rojoOscuro: '#A10F1E',
  verdeOscuro: '#1B6B32',
} as const;

export type ArtiguistaColors = typeof artiguistaColors;
