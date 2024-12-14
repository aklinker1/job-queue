import "./assets/base.css";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import { render } from "solid-js/web";
import App from "./App.tsx";

render(
  () => <App />,
  document.body,
);
