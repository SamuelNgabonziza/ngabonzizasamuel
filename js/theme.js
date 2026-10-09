const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function applySystemTheme(event) {
  const dark = event.matches;
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111018' : '#f7f6fb');
}

applySystemTheme(systemTheme);
systemTheme.addEventListener('change', applySystemTheme);
