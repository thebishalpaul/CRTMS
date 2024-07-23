import React, { useState, useMemo, useCallback } from "react";
import Layout, { Header, Sidebar } from "../../../components/Layout/Layout";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import UserMenu from "../../../components/Layout/DropdownProfile";
import SidebarLinkGroup from "../../../components/Layout/SidebarLinkGroup";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import PreviewTwoToneIcon from "@mui/icons-material/PreviewTwoTone";
import PlaylistAddCheckTwoToneIcon from "@mui/icons-material/PlaylistAddCheckTwoTone";

const SettingsIcon = ({ settingsState }) => (
  <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
    <path
      className={`fill-current ${
        settingsState === "open" ? "text-indigo-500" : "text-slate-600"
      }`}
      d="M19.714 14.7l-7.007 7.007-1.414-1.414 7.007-7.007c-.195-.4-.298-.84-.3-1.286a3 3 0 113 3 2.969 2.969 0 01-1.286-.3z"
    />
    <path
      className={`fill-current ${
        settingsState === "open" ? "text-indigo-300" : "text-slate-400"
      }`}
      d="M10.714 18.3c.4-.195.84-.298 1.286-.3a3 3 0 11-3 3c.002-.446.105-.885.3-1.286l-6.007-6.007 1.414-1.414 6.007 6.007z"
    />
    <path
      className={`fill-current ${
        settingsState === "open" ? "text-indigo-500" : "text-slate-600"
      }`}
      d="M5.7 10.714c.195.4.298.84.3 1.286a3 3 0 11-3-3c.446.002.885.105 1.286.3l7.007-7.007 1.414 1.414L5.7 10.714z"
    />
    <path
      className={`fill-current ${
        settingsState === "open" ? "text-indigo-300" : "text-slate-400"
      }`}
      d="M19.707 9.292a3.012 3.012 0 00-1.415 1.415L13.286 5.7c-.4.195-.84.298-1.286.3a3 3 0 113-3 2.969 2.969 0 01-.3 1.286l5.007 5.006z"
    />
  </svg>
);

const ManagerAdminLayout = ({ children }) => {
  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  // const settingsState = location?.state?.settingsState || "close";
  // const manageUserState = location?.state?.manageUserState || "close";

  const settingsState = localStorage.getItem("settingsState") || "close";
  const manageUserState = localStorage.getItem("manageUserState") || "close";

  const [settingbarExpanded, setSettingbarExpanded] = useState(
    settingsState === "open"
  );

  const [manageUserExpanded, setManageUserExpanded] = useState(
    manageUserState === "open"
  );

  const navLinks = useMemo(
    () => [
      { route: `/${user.role}`, label: "Dashboard", icon: DashboardIcon },
      {
        route: `/${user.role}/projects`,
        label: "Projects",
        icon: SplitscreenIcon,
      },
      {
        route: `/${user.role}/request`,
        label: "Requests",
        icon: PreviewTwoToneIcon,
      },
      {
        route: `/${user.role}/task`,
        label: "Tasks",
        icon: PlaylistAddCheckTwoToneIcon,
      },
    ],
    [user.role]
  );

  const settingsLinks = useMemo(
    () => [
      { route: `/${user.role}/divisions`, label: "Divisions" },
      { route: `/${user.role}/departments`, label: "Departments" },
      {
        route: `/${user.role}/levels`,
        label: "Levels",
        info: "Levels will be fixed across all departments",
      },
      { route: `/${user.role}/configure`, label: "Configure" },
    ],
    [user.role]
  );

  const manageUserLinks = useMemo(
    () => [
      { route: `/${user.role}/users`, label: "Staffs" },
      { route: `/${user.role}/developers`, label: "Developers" },
    ],
    [user.role]
  );

  const renderNavLink = useCallback(
    ({ route, label, icon: Icon }) => (
      <SidebarLinkGroup key={label}>
        {() => (
          <NavLink
            to={route}
            state={{ manageUserState, settingsState }}
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
            </div>
          </NavLink>
        )}
      </SidebarLinkGroup>
    ),
    [pathname, settingsState, manageUserState]
  );

  const renderSettingsLink = useCallback(
    ({ route, label, info }) => (
      <li key={label} className="mb-1 last:mb-0">
        <NavLink
          to={route}
          state={{ manageUserState, settingsState }}
          className={({ isActive }) =>
            "block transition duration-150 truncate " +
            (isActive
              ? "text-indigo-500"
              : "text-slate-400 hover:text-slate-200")
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              {label}
            </span>
            {info && (
              <Tooltip title={info} placement="right" arrow>
                <InfoIcon style={{ marginLeft: 5, fontSize: 18 }} />
              </Tooltip>
            )}
          </div>
        </NavLink>
      </li>
    ),
    [settingsState, manageUserState]
  );

  const renderManageUserLink = useCallback(
    ({ route, label }) => (
      <li key={label} className="mb-1 last:mb-0">
        <NavLink
          to={route}
          state={{ manageUserState, settingsState }}
          className={({ isActive }) =>
            "block transition duration-150 truncate " +
            (isActive
              ? "text-indigo-500"
              : "text-slate-400 hover:text-slate-200")
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              {label}
            </span>
          </div>
        </NavLink>
      </li>
    ),
    [settingsState, manageUserState]
  );

  return (
    <Layout open={open} setOpen={setOpen}>
      <Header>
        <UserMenu align="right" user={user} />
      </Header>
      <Sidebar>
        {navLinks.map(renderNavLink)}

        <SidebarLinkGroup
          activecondition={manageUserState === "open"}
          stateType="manageUserState"
        >
          {(handleClick, open) => (
            <React.Fragment>
              <button
                className={`block text-slate-200 truncate w-full ${
                  manageUserState === "open"
                    ? "transform transition duration-150 hover:text-slate-200"
                    : "hover:text-white"
                }`}
                onClick={() => {
                  setManageUserExpanded(!manageUserExpanded);
                  handleClick();
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PeopleAltIcon
                      className={`h-6 w-6 ${
                        manageUserState === "open"
                          ? "text-indigo-500"
                          : "text-slate-600"
                      }`}
                    />
                    <span className="text-sm text-slate-400 hover:text-slate-200 font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Manage User
                    </span>
                  </div>
                  <div className="flex shrink-0 ml-2">
                    <svg
                      className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${
                        open && "rotate-180"
                      }`}
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </div>
              </button>
              <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                <ul className={`pl-9 mt-1 ${!open && "hidden"}`}>
                  {manageUserLinks.map(renderManageUserLink)}
                </ul>
              </div>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
        <SidebarLinkGroup
          activecondition={settingsState === "open"}
          stateType="settingsState"
        >
          {(handleClick, open) => (
            <React.Fragment>
              <button
                className={`block text-slate-200 truncate w-full ${
                  settingsState === "open"
                    ? "transform transition duration-150 hover:text-slate-200"
                    : "hover:text-white"
                }`}
                onClick={() => {
                  setSettingbarExpanded(!settingbarExpanded);
                  handleClick();
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SettingsIcon settingsState={settingsState} />
                    <span className="text-sm  text-slate-400 hover:text-slate-200 font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                      Settings
                    </span>
                  </div>
                  <div className="flex shrink-0 ml-2">
                    <svg
                      className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${
                        open && "rotate-180"
                      }`}
                      viewBox="0 0 12 12"
                    >
                      <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                    </svg>
                  </div>
                </div>
              </button>
              <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                <ul className={`pl-9 mt-1 ${!open && "hidden"}`}>
                  {settingsLinks.map(renderSettingsLink)}
                </ul>
              </div>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      </Sidebar>
      <div className="my-10 mx-6">{children}</div>
    </Layout>
  );
};

export default ManagerAdminLayout;
