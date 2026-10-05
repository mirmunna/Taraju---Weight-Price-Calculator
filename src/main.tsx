import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for offline app shell caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Auto-update or prompt if needed
  },
  onOfflineReady() {
    console.log('Taraju is ready for offline usage!');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

