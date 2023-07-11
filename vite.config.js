import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/MedicalSystem": {
				//测试
				//target: "http://10.16.48.191:8080",
				//阿里云
				target: "http://8.130.137.118:8080",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/agent/, ""),
			},
		},
	},
});
