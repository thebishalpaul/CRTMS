import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import pendingRequestReducer from '../slices/pendingRequestSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    pendingRequest: pendingRequestReducer,
  },
});
