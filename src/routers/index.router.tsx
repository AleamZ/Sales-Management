import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loader from "@/components/basicUI/loading";
import DashboardLayout from "../layouts/dashboard.layout";
import Sales from "../layouts/sales.layout";
import Login from "../layouts/login.layout";
import PrivateRouter from "./private.router";
import Staff from "@/pages/staffs.page";
import PrivateAdminRouter from "./privateAdmin.router";
const Dashboard = lazy(() => import("../pages/dashboard.page"));
const Products = lazy(() => import("../pages/products.page"));
const Transactions = lazy(() => import("../pages/transactions.page"));
const Customer = lazy(() => import("../pages/customer.page"));
const Reports = lazy(() => import("../pages/reports.page"));
const EditProducts = lazy(() => import("../pages/editPrice.page"));
const Bills = lazy(() => import("../pages/bills.page"));
const ReportsPage = lazy(() => import("../pages/reports.page"));
const TableReportsPage = lazy(() => import("../pages/table-reports.page"));
const AccountSettings = lazy(() => import("../pages/account-settings.page"));
const ForgotPassword = lazy(() => import("../pages/forgot-password.page"));

const MainRouter: React.FC = () => {
  return (
    <Suspense
      fallback={
        <>
          <Loader />
        </>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<PrivateAdminRouter />}>
          <Route element={<DashboardLayout />}>
            <Route path="/staff" element={<Staff />} />
          </Route>
        </Route>
        <Route element={<PrivateRouter />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/pricing" element={<EditProducts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/report" element={<ReportsPage />} />
            <Route path="/reports-table" element={<TableReportsPage />} />
            <Route path="/account-settings" element={<AccountSettings />} />
          </Route>
          <Route path="/sales" element={<Sales />} />
        </Route>
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MainRouter;
