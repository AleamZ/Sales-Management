import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import MainRouter from './routers/index.router'
import "../src/styles/main.styles.scss";
import './index.css' // If you have global styles
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MainRouter />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} /> {/* Optional: adds the dev tools */}
    </QueryClientProvider>
  </React.StrictMode>,
)
