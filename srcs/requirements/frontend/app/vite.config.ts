import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
    	port: 3030,
		https: {
			key: path.resolve(__dirname, './ssl_certificates/frontend_ssl.key'),
			cert: path.resolve(__dirname, './ssl_certificates/frontend_ssl.cert'),
		},
	},
	preview: {
		port: parseInt(process.env.FRONTEND_PORT || '3000'),
	},
	envDir: "../../..",
	clearScreen: false,
})
