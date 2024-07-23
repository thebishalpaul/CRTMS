import React, { useState } from "react";
import SidebarComponent from "./Sidebar";
import AppBar from "./Appbar";

export const Header = ({ children }) => {
  return <>{children}</>;
};

export const Sidebar = ({ children }) => {
  return <>{children}</>;
};

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const header = React.Children.toArray(children).find(
    (child) => child.type === Header
  );
  const sidebar = React.Children.toArray(children).find(
    (child) => child.type === Sidebar
  );
  const content = React.Children.toArray(children).filter(
    (child) => child.type !== Sidebar && child.type !== Header
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SidebarComponent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {sidebar}
      </SidebarComponent>

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden ">
        {/* Site header */}
        <AppBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          {header}
        </AppBar>

        {/* Main content */}
        {content}
      </div>
    </div>
  );
}

export default Layout;
