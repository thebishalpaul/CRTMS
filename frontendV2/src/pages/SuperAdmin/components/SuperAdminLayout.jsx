import React, { useState } from "react";
import Layout, { Header, Sidebar } from "../../../components/Layout/Layout";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import UserMenu from '../../../components/Layout/DropdownProfile';
import SidebarLinkGroup from "../../../components/Layout/SidebarLinkGroup";

const SuperAdminLayout = ({ children }) => {
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  return (
    <>
      <Layout open={open} setOpen={setOpen}>
        <Header>
          <UserMenu
            align="right"
            user={user}
          />
        </Header>
        <Sidebar>
          {/* Sidemenu content */}
          <SidebarLinkGroup>
            {() => {
              return (
                <React.Fragment>
                  <a
                    href="#0"
                    className="block text-slate-200 truncate"
                    onClick={(e) => {
                      e.preventDefault();
                      const route = `/${user.role}`;
                      navigate(route);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                          <path
                            className={`fill-current ${pathname === '/' || pathname.includes('dashboard') ? 'text-indigo-500' : 'text-slate-400'
                              }`}
                            d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z"
                          />
                          <path
                            className={`fill-current ${pathname === '/' || pathname.includes('dashboard') ? 'text-indigo-600' : 'text-slate-600'
                              }`}
                            d="M12 3c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9z"
                          />
                          <path
                            className={`fill-current ${pathname === '/' || pathname.includes('dashboard') ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            d="M12 15c-1.654 0-3-1.346-3-3 0-.462.113-.894.3-1.285L6 6l4.714 3.301A2.973 2.973 0 0112 9c1.654 0 3 1.346 3 3s-1.346 3-3 3z"
                          />
                        </svg>
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          Dashboard
                        </span>
                      </div>
                    </div>
                  </a>
                </React.Fragment>
              );
            }}
          </SidebarLinkGroup>
          <SidebarLinkGroup>
            {() => {
              return (
                <React.Fragment>
                  <a
                    href="#0"
                    className="block text-slate-200 truncate"
                    onClick={(e) => {
                      e.preventDefault();
                      const route = `/${user?.role}/institutes`;
                      navigate(route);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CorporateFareIcon style={{ color: "#94A3B8" }} />
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          Institutes
                        </span>
                      </div>
                    </div>
                  </a>
                </React.Fragment>
              );
            }}
          </SidebarLinkGroup>
        </Sidebar>

        {/* Main Component */}
        <div className="mt-4 mx-6">
          {children}
        </div>
      </Layout>
    </>
  );
};

export default SuperAdminLayout;
