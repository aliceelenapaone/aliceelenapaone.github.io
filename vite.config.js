import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				home: resolve(process.cwd(), "index.html"),
				results: resolve(process.cwd(), "results.html")
			}
		}
	}
});