import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-black text-white h-screen flex overflow-hidden text-sm">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <div className="flex-grow overflow-hidden h-full flex flex-col bg-black">
        <Topbar />
        <div className="flex-grow flex overflow-x-hidden bg-black">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 