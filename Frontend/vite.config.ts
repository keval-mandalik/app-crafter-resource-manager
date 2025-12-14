import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: true,
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI chunk for UI components and styling
          ui: ['@tanstack/react-query', '@hookform/resolvers', 'react-hook-form'],
          
          // Utils chunk for utilities and validation
          utils: ['zod', 'axios'],
        },
      },
    },
    
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  
  // Performance optimizations for development
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'zod',
      'react-hook-form',
    ],
  },
})
