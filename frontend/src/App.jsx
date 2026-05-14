import { useState } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom"; 

// Dark Mode Import
import { useDarkMode } from "./assets/js/useDarkMode";

// Component Import
import Sidebar from "./assets/components/Sidebar";
import Navbar from "./assets/components/Navbar";
import ProtectedRoute from "./Routing/ProtectedRoute";    

// Pages Import
import Dashboard from "./assets/Pages/Dashboard";
import NewInvoice from "./assets/Pages/invoice/NewInvoice";
import ViewInvoice from "./assets/Pages/invoice/ViewInvoice";
import AddCustomer from "./assets/Pages/customer/AddCustomer";
import EditCustomer from "./assets/Pages/customer/EditCustomer";
import ViewCostumers from "./assets/Pages/customer/ViewCostumers";
import Profile from "./assets/Pages/profile/Profile";
import Login from "./assets/Pages/Login";

// ----------------------------------- //

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggle } = useDarkMode();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>

        <Route
          element={
            <div className="flex h-screen w-full bg-xeflow-bg font-sans overflow-hidden">
              <Sidebar isOpen={isSidebarOpen} />
              <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Navbar
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  isDark={isDark}
                  toggleDarkMode={toggle}
                />

                <Outlet />
              </main>
            </div>
          }
        >
          {/* dashboard routes */}

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* invoice routes */}

          <Route path="/invoice/new" element={<NewInvoice />} />
          <Route path="/invoice/view" element={<ViewInvoice />} />

          {/* customer routes */}

          <Route path="/customer/add" element={<AddCustomer />} />
          <Route path="/customer/edit" element={<EditCustomer />} />
          <Route path="/customer/view" element={<ViewCostumers />} />

          {/* Profile routes  */}

          <Route path="/profile" element={<Profile />} />
        
        </Route>
      </Route>
    </Routes>
  );
}
