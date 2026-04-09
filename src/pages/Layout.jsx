import React from "react";
import Navbar from "../components/Navbar";
import { SidebarWithContentSeparator } from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <SidebarWithContentSeparator className="w-64 sticky top-0 h-screen" />

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-white">
          <Navbar />
        </div>

        <main className="flex-1 bg-gray-200 p-4">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
