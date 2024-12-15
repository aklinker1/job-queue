import UnoCSS from "unocss/vite";
import Solid from "vite-plugin-solid";
import { viteSingleFile as SingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
// import Compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    UnoCSS(),
    Solid(),
    visualizer(),
    // @ts-ignore: Vite version mismatches
    SingleFile(),
    // @ts-ignore: Vite version mismatches
    // Compression(),
  ],
  build: {
    outDir: "../lib/public",
    emptyOutDir: true,
  },
});
