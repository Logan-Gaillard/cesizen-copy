import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json"],
			exclude: ["node_modules/**", ".next/**", "**/*.config.*"],
			thresholds: {
				statements: 70,
				branches: 60,
				functions: 75,
				lines: 70,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
});
