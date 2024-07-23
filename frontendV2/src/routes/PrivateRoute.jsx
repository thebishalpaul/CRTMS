import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setToken } from "../slices/userSlice";

const Spinner = () => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    count === 0 &&
      navigate("/signin", {
        state: location.pathname,
      });
    return () => clearInterval(interval);
  }, [count, navigate, location]);

  return (
    <>
      <h1 className="text-center">Redirecting in {count} second...</h1>
      <Loader loading={true} />
    </>
  );
};

export default function PrivateRoute() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const location = useLocation();
  const user = useSelector((state) => state.user);
  const [ok, setOk] = useState(false);

  // console.log(user.token);
  useEffect(() => {
    // Check if user data and token exist in local storage
    const userFromLocalStorage = localStorage.getItem("user");
    const tokenFromLocalStorage = localStorage.getItem("token");
    // console.log(userFromLocalStorage);
    if (userFromLocalStorage && tokenFromLocalStorage) {
      // Dispatch actions to set user data and token in Redux store
      dispatch(setUser(JSON.parse(userFromLocalStorage)));
      dispatch(setToken(tokenFromLocalStorage));
    }

    const authCheck = async () => {
      try {
        const response = await axios.get(`/api/v1/auth/${user.role}-auth`, {
          headers: {
            Authorization: `${user?.token}`,
          },
        });
        if (response.data.ok) {
          setOk(true);
        } else {
          setOk(false);
          alert(response?.data?.message);
        }
      } catch (error) {
        alert(error?.response?.data?.message);
      }
    };
    if (user?.token) authCheck();
  }, [user?.token]);

  return ok ? <Outlet /> : <Spinner />;
}
