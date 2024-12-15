import UnoCSS from "unocss/vite";
import Solid from "vite-plugin-solid";
import { viteSingleFile as SingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    UnoCSS(),
    Solid(),
    // @ts-ignore: Vite version mismatches
    SingleFile(),
    visualizer(),
  ],
  build: {
    outDir: "../lib/public",
    emptyOutDir: true,
  },
});
