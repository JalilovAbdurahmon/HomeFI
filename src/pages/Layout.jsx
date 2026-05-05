import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import { SidebarWithContentSeparator } from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

const Layout = () => {
  // const location = useLocation();

  // // Sahifa (url) o'zgarganda hamma ochiq toastlarni yopib tashlaydi
  // useEffect(() => {
  //   // Sahifa o'zgarganda hech narsa qilmaymiz
  //   // Lekin komponent "unmount" bo'layotganda (yopilayotganda) tozalaymiz
  //   return () => {
  //     toast.dismiss();
  //   };
  // }, [location.pathname]); // Sahifa almashishini kuzatishda davom etamiz
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
