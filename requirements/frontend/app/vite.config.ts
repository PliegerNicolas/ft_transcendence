import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
    	port: 3030,
//		https: {
//			key: fs.readFileSync(`./ssl_certificates/dev.key`),
//			cert: fs.readFileSync(`./ssl_certificates/dev.crt`),
//		},
	},
	preview: {
		port: parseInt(process.env.PORT || '3000'),
	},
	envDir: "../../..",
	clearScreen: false,
})
