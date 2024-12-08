import UnoCSS from "unocss/vite";
import Solid from "vite-plugin-solid";
import { viteSingleFile as SingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    UnoCSS(),
    Solid(),
    // @ts-ignore: Vite version mismatches
    SingleFile(),
  ],
  build: {
    outDir: "../lib/public",
    emptyOutDir: true,
  },
});
