import React, { useCallback, useMemo, useState } from "react";
import Layout, { Header, Sidebar } from "../../../components/Layout/Layout";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PreviewTwoToneIcon from "@mui/icons-material/PreviewTwoTone";
import UserMenu from "../../../components/Layout/DropdownProfile";
import SidebarLinkGroup from "../../../components/Layout/SidebarLinkGroup";
import ManageAccountsTwoToneIcon from "@mui/icons-material/ManageAccountsTwoTone";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PendingActionsTwoToneIcon from "@mui/icons-material/PendingActionsTwoTone";

const RequesterAdminLayout = ({ children }) => {
  const user = useSelector((state) => state.user);
  const pendingRequestCount = useSelector(
    (state) => state.pendingRequest.count
  );
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const { pathname } = location;
  const settingsState = location?.state?.settingsState || "close";
  // const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  // const [sidebarExpanded, setSidebarExpanded] = useState(
  //   settingsState === "open"
  // );

  const navLinks = useMemo(
    () => [
      { route: `/${user.role}`, label: "Dashboard", icon: DashboardIcon },
      { route: `/${user.role}/users`, label: "Users", icon: PeopleAltIcon },

      {
        route: `/${user.role}/create-requests`,
        label: "Create & View Requests",
        icon: PreviewTwoToneIcon,
      },
      {
        route: `/${user.role}/pending-request`,
        label: "Pending Requests",
        icon: PendingActionsTwoToneIcon,
        badge: pendingRequestCount,
      },
      {
        route: `/${user.role}/manage-access`,
        label: "Manage Access",
        icon: ManageAccountsTwoToneIcon,
      },
    ],
    [user.role]
  );
  const renderNavLink = useCallback(
    ({ route, label, icon: Icon, badge }) => (
      <SidebarLinkGroup key={label}>
        {() => (
          <NavLink
            to={route}
            state={{ settingsState }}
            className={`block truncate transition duration-150 ${
              pathname.endsWith(route)
                ? "text-indigo-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon
                  style={{
                    color: `${
                      pathname.endsWith(route) ? "#1561cb" : "#94A3B8"
                    }`,
                  }}
                />
                <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                  {label}
                </span>
              </div>
              {badge !== undefined && badge !== null && (
                <div className="flex flex-shrink-0 ml-2">
                  <span className="inline-flex items-center justify-center h-5 text-xs font-medium text-white bg-indigo-500 px-2 rounded">
                    {badge || 0}
                  </span>
                </div>
              )}
            </div>
          </NavLink>
        )}
      </SidebarLinkGroup>
    ),
    [pathname, settingsState]
  );

  return (
    <>
      <Layout open={open} setOpen={setOpen}>
        <Header>
          <UserMenu align="right" user={user} />
        </Header>
        <Sidebar>
          {/* Sidemenu content */}
          {navLinks.map(renderNavLink)}
        </Sidebar>
        {/* Main Component */}
        <div className="my-10 mx-6">{children}</div>
      </Layout>
    </>
  );
};

export default RequesterAdminLayout;
