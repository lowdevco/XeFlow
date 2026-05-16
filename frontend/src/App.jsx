import { useState } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Dark Mode Import

import { useDarkMode } from "./assets/js/useDarkMode";

// Component Import

import Sidebar from "./assets/components/Sidebar";
import Navbar from "./assets/components/Navbar";
import ProtectedRoute from "./Routing/ProtectedRoute";
import PublicRoute from "./Routing/PublicRoute"; 

// Pages Import

import Dashboard from "./assets/Pages/Dashboard";
import Profile from "./assets/Pages/profile/Profile";
import Login from "./assets/Pages/Login";
import NewInvoice from "./assets/Pages/invoice/NewInvoice";
import EditInvoice from "./assets/Pages/invoice/EditInvoice";
import ViewInvoice from "./assets/Pages/invoice/ViewInvoice";
import AddCustomer from "./assets/Pages/customer/AddCustomer";
import EditCustomer from "./assets/Pages/customer/EditCustomer";
import ViewCostumers from "./assets/Pages/customer/ViewCostumers";
import AddService from "./assets/Pages/Service/AddService";
import EditService from "./assets/Pages/Service/EditService";
import AllService from "./assets/Pages/Service/AllService";

// ----------------------------------- //

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggle } = useDarkMode();

  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 100, 
          right: 30,
        }}
        toastOptions={{
          className:
            "!bg-xeflow-surface !text-xeflow-text !border !border-xeflow-border !shadow-lg",

          style: {
            borderRadius: "12px",
          },

          success: {
            iconTheme: {
              primary: "#06b6d4",
              secondary: "inherit",
            },
          },
        }}
      />

      <Routes>
        {/*  Public routes  */}

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/*  Protected routes  */}

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

            {/* Profile routes  */}

            <Route path="/profile" element={<Profile />} />

            {/* invoice routes */}

            <Route path="/invoice/new" element={<NewInvoice />} />
            <Route path="/invoice/edit" element={<EditInvoice />} />
            <Route path="/invoice/view" element={<ViewInvoice />} />

            {/* customer routes */}

            <Route path="/customer/add" element={<AddCustomer />} />
            <Route path="/customer/edit" element={<EditCustomer />} />
            <Route path="/customer/view" element={<ViewCostumers />} />

            {/* Service routes  */}

            <Route path="/service/add" element={<AddService />} />
            <Route path="/service/edit" element={<EditService />} />
            <Route path="/service/all" element={<AllService />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
