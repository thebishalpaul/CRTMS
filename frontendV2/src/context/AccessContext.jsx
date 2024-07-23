import axios from "axios";
import React, { createContext, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const AccessContext = createContext();

export const AccessProvider = ({ children }) => {
  const [access, setAccess] = useState(null);
  const user = useSelector((state) => state.user);

  const getAccess = async () => {
    try {
      const response = await axios.get(`/api/v1/user/my-access/`, {
        headers: {
          Authorization: `${user.token}`,
        },
      });

      if (response?.data?.success) {
        setAccess(response?.data?.access);
      }
    } catch (error) {
      console.log(error);
      setAccess(null);
    }
  };

  useEffect(() => {
    getAccess();
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("levelsChange", (updatedLevels) => {
      getAccess();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, user?.token]);

  return (
    <AccessContext.Provider value={access}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  return useContext(AccessContext);
};
