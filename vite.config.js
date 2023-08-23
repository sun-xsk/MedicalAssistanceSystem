import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'
import { URL } from "url";

export default defineConfig({
	plugins: [react()],
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"util": path.resolve(__dirname, "src/util")
		}
	},
	server: {
		proxy: {
			"/api": {
				//测试
				//target: "http://10.16.48.191:8080",
				//阿里云
				// target: "http://8.130.137.118:8080",
				target: "http://10.19.0.26:51010/MedicalSystem",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
});
