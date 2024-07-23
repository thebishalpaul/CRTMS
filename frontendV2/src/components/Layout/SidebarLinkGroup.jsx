import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SidebarLinkGroup({ children, activecondition, stateType }) {
  const [open, setOpen] = useState(activecondition);

  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.setItem(
      stateType,
      localStorage.getItem(stateType) === "open" ? "closed" : "open"
    );

    setOpen(!open);
  };

  return (
    <li
      className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 ${
        activecondition && "bg-slate-900"
      }`}
    >
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup;
