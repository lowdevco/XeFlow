import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import { useDarkMode } from "./assets/js/useDarkMode";

export default function App() {
  // State to track if sidebar is open (defaults to true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggle } = useDarkMode(); 
  return (
    <div className="flex h-screen w-full bg-xeflow-bg font-sans overflow-hidden">
      {/* Pass the state to the Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Pass the toggle function to the Navbar */}
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDark={isDark}
          toggleDarkMode={toggle}
        />
        <Dashboard />
      </main>
    </div>
  );
}
