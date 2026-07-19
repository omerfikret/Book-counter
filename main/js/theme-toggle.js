'use strict';

/* ============================================================
   THEME TOGGLE — Ex Libris light/dark mode
   ------------------------------------------------------------
   - On load: uses the saved user choice if there is one,
     otherwise follows the OS preference (no attribute set,
     so the prefers-color-scheme media query in variables.css
     takes over automatically).
   - Toggling writes an explicit choice to localStorage and
     sets <html data-theme="light|dark"> to force it, so the
     user's pick always wins over the OS setting from then on.
   - Also listens for OS-level changes, in case the user hasn't
     made an explicit in-app choice yet.
   ============================================================ */

const THEME_STORAGE_KEY = 'reading-app-theme';

function applyTheme(theme) {
    // theme is 'light', 'dark', or null (meaning: follow the OS)
    if (theme === 'light' || theme === 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

function saveTheme(theme) {
    try {
        if (theme) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } else {
            localStorage.removeItem(THEME_STORAGE_KEY);
        }
    } catch (e) {
        /* localStorage unavailable (private mode etc.) — theme just won't persist */
    }
}

function currentEffectiveTheme() {
    const saved = getSavedTheme();
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme() {
    const next = currentEffectiveTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
}

function initTheme() {
    const saved = getSavedTheme();
    applyTheme(saved);

    document.querySelectorAll('.theme-toggle').forEach((btn) => {
        btn.addEventListener('click', toggleTheme);
    });

    // If the user hasn't made an explicit choice, keep following the OS live.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', () => {
        if (!getSavedTheme()) {
            // No explicit override: data-theme stays unset, CSS media query
            // handles it automatically. Nothing to do here.
        }
    });
}

document.addEventListener('DOMContentLoaded', initTheme);