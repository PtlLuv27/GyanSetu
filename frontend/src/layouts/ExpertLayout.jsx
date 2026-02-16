import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Using your dynamic sidebar

const ExpertLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* We use your existing Sidebar component here. 
          It already handles role detection and shows the Expert menu 
          (Dashboard, Syllabus, Materials, Videos, Students).
      */}
      <Sidebar />

      {/* Main Content Area 
          We add 'ml-64' because your Sidebar is 'fixed' and 'w-64'.
          Without this margin, the content would hide behind the sidebar.
      */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
};

export default ExpertLayout;