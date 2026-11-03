import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → le site fonctionne depuis n'importe quelle adresse,
// y compris https://pseudo.github.io/carte-commune/
export default defineConfig({ base: './', plugins: [react()] })
