import UnoCSS from "unocss/vite";
import Solid from "vite-plugin-solid";
import { viteSingleFile as SingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    UnoCSS(),
    Solid(),
    SingleFile(),
  ],
  build: {
    outDir: "../lib/public",
    emptyOutDir: true,
  },
});
