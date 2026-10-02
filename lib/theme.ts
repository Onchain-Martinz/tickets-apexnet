export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "party-night-theme";

export const themeInitializationScript = `
(() => {
  try {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    const theme = storedTheme === "light" ? "light" : "dark";

    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {}
})();
`;
