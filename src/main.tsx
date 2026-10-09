
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the document title programmatically
document.title = "Bio Sense - Health Monitoring";

createRoot(document.getElementById("root")!).render(<App />);
