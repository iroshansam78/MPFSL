import { BrowserRouter } from 'react-router'
import App from './App.jsx'

// The public site in the browser. At build time the same App is rendered by entry-server.jsx.
function PublicSite() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default PublicSite
