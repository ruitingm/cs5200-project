/**
 * Entry point for SQL Study Room frontend
 * - Finds <div id="root"> element in index.html
 * - Renders the entire React app into that root element
 * - Wraps the app with Redux <Provider> so all components can access the store
 * - Loads the App component, which handles routing and initial data loading
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store/store.ts";

createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
