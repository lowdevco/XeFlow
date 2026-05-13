import { useState } from "react";
import { Route, Routes } from "react-router-dom";

// Dark Mode Import 

import { useDarkMode } from "./assets/js/useDarkMode";

// Component Import

import Sidebar from "./assets/components/Sidebar";
import Navbar from "./assets/components/Navbar";

// Pages Import

import Dashboard from "./assets/Pages/Dashboard";
import NewInvoice from "./assets/Pages/invoice/NewInvoice"; 
import ViewInvoice from "./assets/Pages/invoice/ViewInvoice";
import AddCustomer from "./assets/Pages/customer/AddCustomer";
import EditCustomer from "./assets/Pages/customer/EditCustomer";
import ViewCostumers from "./assets/Pages/customer/ViewCostumers";  


// ----------------------------------- //


export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggle } = useDarkMode(); 
  return (
    <div className="flex h-screen w-full bg-xeflow-bg font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDark={isDark}
          toggleDarkMode={toggle}
        />
        <Routes>
          <Route path="/" element={<Dashboard/>} />  
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoice/new" element={<NewInvoice />} /> 
          <Route path="/invoice/view" element={<ViewInvoice />} /> 
          <Route path="/customer/add" element={<AddCustomer />} />
          <Route path="/customer/edit" element={<EditCustomer />} />
          <Route path="/customer/view" element={<ViewCostumers />} /> 
        </Routes>
      </main>
    </div>
  );
}
