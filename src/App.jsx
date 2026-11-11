import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Dev-only fixture for visual checks (docs/decisionlog.md D29). The import sits behind
// import.meta.env.DEV, so production builds leave it out.
const TokenSheet = import.meta.env.DEV ? lazy(() => import("./dev/TokenSheet.jsx")) : null;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {TokenSheet && (
        <Route
          path="/dev/tokens"
          element={
            <Suspense fallback={null}>
              <TokenSheet />
            </Suspense>
          }
        />
      )}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
