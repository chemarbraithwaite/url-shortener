import { defineConfig } from "vite";
import dotenv from "dotenv";
import react from "@vitejs/plugin-react";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  envDir: process.cwd(),
  define: {
    "process.env": JSON.stringify(process.env),
  },
  plugins: [react()],
});
