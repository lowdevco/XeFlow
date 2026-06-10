import { useState, useEffect } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Dark Mode Import

import { useDarkMode } from "./assets/js/useDarkMode";

// Component Import

import Sidebar from "./assets/components/Sidebar";
import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";
import ProtectedRoute from "./Routing/ProtectedRoute";
import PublicRoute from "./Routing/PublicRoute"; 

// Pages Import

import Dashboard from "./assets/Pages/Dashboard";
import Profile from "./assets/Pages/profile/Profile";
import Login from "./assets/Pages/Login";
import NewInvoice from "./assets/Pages/invoice/NewInvoice";
import EditInvoice from "./assets/Pages/invoice/EditInvoice";
import ViewInvoice from "./assets/Pages/invoice/ViewInvoice";
import Ledger from "./assets/Pages/invoice/Ledger";
import AddCustomer from "./assets/Pages/customer/AddCustomer";
import EditCustomer from "./assets/Pages/customer/EditCustomer";
import ViewCostumers from "./assets/Pages/customer/ViewCostumers";
import AddService from "./assets/Pages/Service/AddService";
import EditService from "./assets/Pages/Service/EditService";
import AllService from "./assets/Pages/Service/AllService";
import AddUser from "./assets/Pages/users/AddUser";
import EditUser from "./assets/Pages/users/EditUser";
import ViewUser from "./assets/Pages/users/ViewUser";
import AddUserGroup from "./assets/Pages/user-group/AddUserGroup";
import EditUserGroup from "./assets/Pages/user-group/EditUserGroup";
import ViewUserGroup from "./assets/Pages/user-group/ViewUserGroup";
import Overview from "./assets/Pages/Analytics/Overview";
import Revenue from "./assets/Pages/Analytics/Revenue";


// ----------------------------------- //

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const { isDark, toggle } = useDarkMode();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      <AuthProvider>
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
                  {isSidebarOpen && (
                    <div 
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden transition-all duration-300"
                      onClick={() => setIsSidebarOpen(false)}
                    />
                  )}

                  <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                  <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    <Navbar
                      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                      isDark={isDark}
                      toggleDarkMode={toggle}
                    />

                    <div className="flex-1 overflow-y-auto flex flex-col">
                      <div className="flex-1">
                        <Outlet />
                      </div>
                      <Footer />
                    </div>
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
              <Route path="/invoice/ledger" element={<Ledger />} />

              {/* customer routes */}

              <Route path="/customer/add" element={<AddCustomer />} />
              <Route path="/customer/edit" element={<EditCustomer />} />
              <Route path="/customer/view" element={<ViewCostumers />} />

              {/* Service routes  */}

              <Route path="/service/add" element={<AddService />} />
              <Route path="/service/edit" element={<EditService />} />
              <Route path="/service/all" element={<AllService />} />

              {/* User routes  */}

              <Route path="/user/add" element={<AddUser />} />
              <Route path="/user/edit" element={<EditUser />} />
              <Route path="/user/view" element={<ViewUser />} />

              {/* User group routes  */}

              <Route path="/user-group/add" element={<AddUserGroup />} />
              <Route path="/user-group/edit" element={<EditUserGroup />} />
              <Route path="/user-group/view" element={<ViewUserGroup />} />

              {/* Analytics routes  */}

              <Route path="/analytics/overview/" element={<Overview />} />
              <Route path="/analytics/revenue/" element={<Revenue />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </>
  );
}
