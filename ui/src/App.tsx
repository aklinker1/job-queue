import { Route, Router } from "@solidjs/router";
import Dashboard from "./pages/Dashboard.tsx";
import Dead from "./pages/Dead.tsx";
import Failed from "./pages/Failed.tsx";
import Enqueued from "./pages/Enqueued.tsx";
import DefaultLayout from "./layouts/DefaultLayout.tsx";

export default (() => {
  return (
    <Router root={DefaultLayout}>
      <Route path="/" component={Dashboard} />
      <Route path="/enqueued" component={Enqueued} />
      <Route path="/failed" component={Failed} />
      <Route path="/dead" component={Dead} />
    </Router>
  );
});
