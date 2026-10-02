export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "party-night-theme";

export const themeInitializationScript = `
(() => {
  try {
    const root = document.documentElement;
    root.classList.add("dark");
    root.dataset.theme = "dark";
    root.style.colorScheme = "dark";
  } catch (error) {}
})();
`;
