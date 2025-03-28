import { useEffect } from "react";
import { HomePage } from "./pages/HomePage";

function App() {
  useEffect(() => {
    const start = performance.now();

    requestAnimationFrame(() => {
      const loadTime = performance.now() - start;
      console.log(`Page loaded in ${loadTime.toFixed(2)} ms`);
    });
  }, []);

  return <HomePage />;
}

export default App;
