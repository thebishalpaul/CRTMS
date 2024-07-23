import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FormControl, MenuItem, Select } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { BsChevronExpand } from "react-icons/bs";
import { MdCheck } from "react-icons/md";
import { getInitials } from "../../../../utils";
import axios from "axios";

const UserList = ({ setTeam, team }) => {
  const [data, setData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(""); // Single user selection
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/v1/user/developers", {
        headers: {
          Authorization: `${user.token}`
        }
      });
      if (response.data.success) {
        setData(response.data.developers);
      } else {
        setError(response.data.message || "Failed to fetch developers");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch developers");
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const selectedId = event.target.value;
    setSelectedUserId(selectedId);
    setTeam(selectedId);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  return (
    <div>
      <p className="text-gray-700">Assign Task To:</p>
      <FormControl sx={{ width: "30rem" }}>
        <Select
          labelId="user-list-label"
          id="user-list-select"
          value={selectedUserId}
          onChange={handleChange}
          renderValue={(selected) =>
            data.find((user) => user._id === selected)?.name || ""
          }
          IconComponent={BsChevronExpand}
        >
          {data.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600">
                  <span className="text-center text-[10px]">
                    {getInitials(user.name)}
                  </span>
                </div>
                <span>{user.name}</span>
                {selectedUserId === user._id && (
                  <MdCheck className="h-5 w-5 text-amber-600" aria-hidden="true" />
                )}
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default UserList;
