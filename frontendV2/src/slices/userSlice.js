import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch user data
export const getUser = createAsyncThunk(
  "user/getUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get userId from the current state
      const userId = getState().user._id;
      const response = await axios.get(`/api/v1/user/${userId}`);
      if (response.data.success) {
        const user = {
          ...response.data.user,
          institute: response.data.user.institute?._id,
          department: response.data.user.institute?.manager_department,
        };
        return response.data.user;
      } else {
        return rejectWithValue(response.data.message || "Internal Error");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network Error");
    }
  }
);

// Initial state
const initialState = {
  _id: "",
  name: "",
  email: "",
  role: "",
  token: "",
  projects: [],
  institute: "",
  department: "",
  profile_picture: "",
};

// Helper function to set user data in state and localStorage
const setUserData = (state, user) => {
  state._id = user._id;
  state.name = user.name;
  state.email = user.email;
  state.role = user.role;
  state.projects = user.projects;
  state.institute = user?.institute?._id || "";
  state.department = user?.institute?.manager_department || "";
  state.profile_picture = user.profile_picture;
  localStorage.setItem("user", JSON.stringify(user));
};

// Create slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      setUserData(state, action.payload);
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    clearUser: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUser.fulfilled, (state, action) => {
      setUserData(state, action.payload);
    });
    builder.addCase(getUser.rejected, (state) => {
      Object.assign(state, initialState);
    });
  },
});

// Export actions
export const { setUser, setToken, clearUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;