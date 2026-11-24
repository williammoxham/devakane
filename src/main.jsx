import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/newsreader/opsz.css';
import './styles/global.css';
import './styles/apple.css';
import './styles/theme.css';
import './styles/luxe.css';
import './styles/contrast.css';
import './styles/journal.css';

// HashRouter is only used for static previews (npm run build:preview). Vercel uses clean URLs.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
