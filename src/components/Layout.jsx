import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ role, children }) => {
  return (
    <div className="flex w-full min-h-screen bg-slate-50 font-sans">
      <Sidebar role={role} />

      <div className="flex-1 ml-64 p-8 w-full min-h-screen overflow-x-hidden">
        <div className="w-full">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default Layout;