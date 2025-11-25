import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Reduce noisy console output in production only
(() => {
  try {
    if (import.meta.env.PROD) {
      console.log = () => {};
      console.debug = () => {};
      console.warn = () => {};
    }
  } catch {
    // no-op
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)