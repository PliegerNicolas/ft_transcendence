import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
    	port: 3030,
		https: {
			key: fs.readFileSync('./ssl_certs/localhost.key'),
			cert: fs.readFileSync('./ssl_certs/localhost.crt'),
		},
	},
	preview: {
		port: parseInt(process.env.PORT || '3000'),
	},
	envDir: "../../..",
	clearScreen: false,
})
