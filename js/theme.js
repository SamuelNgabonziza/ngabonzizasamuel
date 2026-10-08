const themeButton = document.getElementById('theme-toggle');
function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  try { localStorage.setItem('flowshield-theme-v2', isDark ? 'dark' : 'light'); } catch { /* private browsing */ }
  if (themeButton) {
    themeButton.textContent = isDark ? 'Use light theme' : 'Use dark theme';
    themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.setAttribute('aria-pressed', String(isDark));
  }
}

let preference = 'dark';
try { preference = localStorage.getItem('flowshield-theme-v2') || 'dark'; } catch { /* private browsing */ }
setTheme(preference);
themeButton?.addEventListener('click', () => setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark'));
