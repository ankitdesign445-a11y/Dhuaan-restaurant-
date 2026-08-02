import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2018",
    // esbuild minification (Vite's default) — fast and effective for both JS and CSS.
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split rarely-changing vendor code into its own cacheable chunk,
        // separate from Firebase (also large) and the app's own code.
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/firestore"],
        },
      },
    },
    // Warn if any chunk balloons unexpectedly — helps catch regressions later.
    chunkSizeWarningLimit: 600,
  },
});
