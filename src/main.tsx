import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper.tsx';  // Import the AppWrapper component
import './index.css';

// Render the AppWrapper component
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />  {/* This will render the landing page, auth page, or main app */}
  </StrictMode>
);
