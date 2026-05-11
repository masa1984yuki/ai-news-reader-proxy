import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SavedNews from "./pages/SavedNews";
import { Button } from "@/components/ui/button";

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "saved">("home");

  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        {/* ナビゲーション */}
        <div className="fixed top-0 right-0 z-40 p-4 flex gap-2">
          <Button
            variant={currentPage === "home" ? "default" : "outline"}
            onClick={() => setCurrentPage("home")}
          >
            最新ニュース
          </Button>
          <Button
            variant={currentPage === "saved" ? "default" : "outline"}
            onClick={() => setCurrentPage("saved")}
          >
            保存済みニュース
          </Button>
        </div>
        {/* ページ表示 */}
        {currentPage === "home" && <Home />}
        {currentPage === "saved" && <SavedNews />}
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
