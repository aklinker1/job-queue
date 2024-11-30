import { defineConfig, presetIcons, presetWind } from "unocss";

export default defineConfig({
  presets: [presetWind(), presetIcons()],
  shortcuts: {
    "nav-item":
      "block flex h-full font-medium px-4 gap-3 uppercase items-center bg-black:0 hover:bg-black:10 active:bg-black:20 transition",
    "badge": "text-xs px-1 border border-black text-black rounded-full",
    "badge-blue": "border-blue text-blue",
    "badge-amber": "border-amber text-amber",
    "badge-red": "border-red text-red",
    "badge-grey": "border-gray text-gray",
  },
});
