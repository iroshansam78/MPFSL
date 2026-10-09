import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './styles/global.css'
import { applyFilmGrain } from './utils/filmGrain.js'
import App from './App.jsx'

applyFilmGrain()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
