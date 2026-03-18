import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const cdnBase = import.meta.env.VITE_ASSET_CDN_BASE || ''
if (cdnBase) {
  const base = cdnBase.replace(/\/$/, '')
  document.documentElement.style.setProperty(
    '--global-bg-image',
    `url(${base}/images/background.webp)`
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
