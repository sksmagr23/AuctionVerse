import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#e5e5e5]">
      <Header />
      <main className="flex-grow mx-2 px-2 md:px-4 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 