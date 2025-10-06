import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Theme = 'light' | 'dark' | 'sepia';
type FontSize = 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl';
type FontFamily = 'font-sans' | 'font-serif' | 'font-mono';
type LineHeight = 'leading-normal' | 'leading-relaxed' | 'leading-loose';
const themes: Theme[] = ['dark', 'light', 'sepia'];
const fontSizes: FontSize[] = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
const fontFamilies: FontFamily[] = ['font-sans', 'font-serif', 'font-mono'];
const lineHeights: LineHeight[] = ['leading-normal', 'leading-relaxed', 'leading-loose'];
interface ReaderSettingsState {
  theme: Theme;
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineHeight: LineHeight;
  cycleTheme: () => void;
  cycleFontSize: () => void;
  cycleFontFamily: () => void;
  cycleLineHeight: () => void;
}
export const useReaderSettingsStore = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      fontSize: 'text-lg',
      fontFamily: 'font-sans',
      lineHeight: 'leading-relaxed',
      cycleTheme: () =>
        set((state) => {
          const currentIndex = themes.indexOf(state.theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          return { theme: themes[nextIndex] };
        }),
      cycleFontSize: () =>
        set((state) => {
          const currentIndex = fontSizes.indexOf(state.fontSize);
          const nextIndex = (currentIndex + 1) % fontSizes.length;
          return { fontSize: fontSizes[nextIndex] };
        }),
      cycleFontFamily: () =>
        set((state) => {
          const currentIndex = fontFamilies.indexOf(state.fontFamily);
          const nextIndex = (currentIndex + 1) % fontFamilies.length;
          return { fontFamily: fontFamilies[nextIndex] };
        }),
      cycleLineHeight: () =>
        set((state) => {
          const currentIndex = lineHeights.indexOf(state.lineHeight);
          const nextIndex = (currentIndex + 1) % lineHeights.length;
          return { lineHeight: lineHeights[nextIndex] };
        }),
    }),
    {
      name: 'novel-nest-reader-settings',
    }
  )
);