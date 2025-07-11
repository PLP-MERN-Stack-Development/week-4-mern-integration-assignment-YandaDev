import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PostProvider } from './context/PostContext'
import { CategoriesProvider } from './context/CategoriesContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostProvider>
      <CategoriesProvider>
        <App />
      </CategoriesProvider>
    </PostProvider>
  </StrictMode>,
)