import { decodeToken } from "@/utils/jwt.utils";
import { Navigate, Outlet } from "react-router-dom";

const PrivateAdminRouter = () => {
  const admin = decodeToken(localStorage.getItem("accessToken") || "");
  return admin.role === "ADMIN" ? <Outlet /> : <Navigate to={"/"} />;
};

export default PrivateAdminRouter;
