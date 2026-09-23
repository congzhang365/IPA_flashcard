import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// The app previously registered a hand-written worker during development.
// Remove that stale worker locally so it cannot serve an old audio service or
// cached application bundle. This branch is omitted from production builds.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
