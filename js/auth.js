import { getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig, firebaseReady } from './firebase-config.js';

export function initAuth() {
  const form = document.getElementById('auth-form');
  const status = document.getElementById('auth-status');
  const heading = document.getElementById('auth-heading');
  const description = document.getElementById('auth-description');
  const submit = document.getElementById('auth-submit');
  const confirmWrap = document.getElementById('confirm-password-wrap');
  const confirmInput = document.getElementById('auth-confirm-password');
  const loginTab = document.getElementById('auth-login-tab');
  const signupTab = document.getElementById('auth-signup-tab');
  if (!form || !status) return;

  let mode = new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'login';
  const setMode = nextMode => {
    mode = nextMode;
    const signup = mode === 'signup';
    document.body.dataset.authMode = mode;
    heading.textContent = signup ? 'Create your account.' : 'Welcome back.';
    description.textContent = signup ? 'Join a thoughtful space for ideas and conversation.' : 'Sign in to continue exploring.';
    submit.innerHTML = signup ? 'Create account <span aria-hidden="true">→</span>' : 'Log in <span aria-hidden="true">→</span>';
    confirmWrap.classList.toggle('hidden', !signup);
    confirmInput.required = signup;
    document.getElementById('auth-password').autocomplete = signup ? 'new-password' : 'current-password';
    loginTab.classList.toggle('auth-mode-active', !signup);
    signupTab.classList.toggle('auth-mode-active', signup);
    status.textContent = firebaseReady ? (signup ? 'Your account is secured by Firebase Authentication.' : 'Sign in securely with Firebase Authentication.') : 'Firebase is not connected. Check js/firebase-config.js.';
  };

  loginTab.addEventListener('click', event => { event.preventDefault(); setMode('login'); history.replaceState(null, '', 'auth.html?mode=login'); });
  signupTab.addEventListener('click', event => { event.preventDefault(); setMode('signup'); history.replaceState(null, '', 'auth.html?mode=signup'); });
  setMode(mode);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!firebaseReady) { status.textContent = 'Connect Firebase in js/firebase-config.js before creating an account.'; return; }
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const confirmation = String(data.get('confirmPassword') || '');
    if (mode === 'signup' && password !== confirmation) { status.textContent = 'Those passwords do not match. Please check them and try again.'; confirmInput.focus(); return; }

    submit.disabled = true;
    status.textContent = mode === 'signup' ? 'Creating your account…' : 'Signing you in…';
    try {
      const app = getApps().find(existing => existing.name === '[DEFAULT]') || initializeApp(firebaseConfig);
      const auth = getAuth(app);
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      status.textContent = mode === 'signup' ? 'Your account is ready. Taking you to the ideas…' : 'You’re signed in. Taking you to the ideas…';
      window.location.assign('posts.html');
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': 'An account already uses that email. Try logging in.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/invalid-credential': 'The email or password does not match an account.',
        'auth/user-not-found': 'No account uses that email yet. Try creating one.',
        'auth/wrong-password': 'The password is incorrect. Try again.',
        'auth/weak-password': 'Choose a stronger password with at least six characters.',
        'auth/operation-not-allowed': 'Email and password sign-in is not enabled in Firebase Authentication.',
        'auth/too-many-requests': 'Too many attempts. Wait a little and try again.'
      };
      status.textContent = messages[error.code] || 'We could not complete that request. Please try again.';
    } finally {
      submit.disabled = false;
    }
  });
}
