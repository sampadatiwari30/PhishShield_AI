import { Navbar } from "./components/Navbar";
import { useRoute } from "./lib/router";
import { HomePage } from "./pages/HomePage";
import { ScannerPage } from "./pages/ScannerPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AboutPage } from "./pages/AboutPage";

function App() {
  const route = useRoute();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {route === "home" && <HomePage />}
        {route === "scanner" && <ScannerPage />}
        {route === "history" && <HistoryPage />}
        {route === "about" && <AboutPage />}
      </main>
    </div>
  );
}

export default App;
