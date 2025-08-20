import { Navigate, Outlet } from "react-router-dom";

const PrivateRouter = () => {
  const token = localStorage.getItem("refreshToken");
  return token ? <Outlet /> : <Navigate to={"/login"} />;
};

export default PrivateRouter;
