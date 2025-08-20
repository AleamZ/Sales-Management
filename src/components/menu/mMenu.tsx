import React from "react";
import { Menu, Modal } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MobileMenu from "./mobileMenu";
import { Row, Col } from "antd";
import { decodeToken } from "@/utils/jwt.utils";

const { SubMenu } = Menu;

const MMenu: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const admin = decodeToken(localStorage.getItem("accessToken") || "");
  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Row>
        <Col span={2} className="ant-menu-horizontal"></Col>
        <Col span={20} className="header">
          <Menu
            mode="horizontal"
            selectedKeys={[getCurrentSelectedKey(currentPath)]}
            onClick={(info) => {
              console.log("Menu item clicked:", info);
            }}
          >
            <Menu.Item key="overview" icon={<DashboardOutlined />}>
              <Link to="/" onClick={() => handleMenuClick("/")}>
                Tổng Quan
              </Link>
            </Menu.Item>
            <SubMenu
              key="products"
              icon={<ShoppingOutlined />}
              title="Hàng Hóa"
            >
              <Menu.Item key="products-list">
                <Link
                  to="/products"
                  onClick={() => handleMenuClick("/products")}
                >
                  Tất Cả Hàng Hóa
                </Link>
              </Menu.Item>
              <Menu.Item key="products-pricing">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    Modal.info({
                      title: "Thông báo",
                      content:
                        "Tính năng sẽ được update trong phiên bản tiếp theo",
                    });
                  }}
                  href="#"
                >
                  Thiết Lập Giá
                </a>
              </Menu.Item>
              <Menu.Item key="products-inventory">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    Modal.info({
                      title: "Thông báo",
                      content:
                        "Tính năng sẽ được update trong phiên bản tiếp theo",
                    });
                  }}
                  href="#"
                >
                  Kiểm Kho
                </a>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="sales" icon={<ShoppingCartOutlined />}>
              <Link to="/sales" onClick={() => handleMenuClick("/sales")}>
                Bán Hàng
              </Link>
            </Menu.Item>
            <Menu.Item key="bills" icon={<FileTextOutlined />}>
              <Link to="/bills" onClick={() => handleMenuClick("/bills")}>
                Hóa Đơn
              </Link>
            </Menu.Item>

            <SubMenu key="customer" icon={<TeamOutlined />} title="Đối Tác">
              <Menu.Item key="customer-list">
                <Link
                  to="/customer"
                  onClick={() => handleMenuClick("/customer")}
                >
                  Khách Hàng
                </Link>
              </Menu.Item>
              {admin?.role === "ADMIN" && (
                <Menu.Item key="staff-list">
                  <Link to="/staff">Nhân viên</Link>
                </Menu.Item>
              )}
            </SubMenu>
            <SubMenu key="reports" icon={<BarChartOutlined />} title="Báo Cáo">
              <Menu.Item key="reports-general">
                <Link to="/reports" onClick={() => handleMenuClick("/reports")}>
                  Báo Cáo Tổng Hợp
                </Link>
              </Menu.Item>
              <Menu.Item key="reports-general-table">
                <Link to="/reports-table" onClick={() => handleMenuClick("/reports-table")}>
                  Báo Cáo Dạng Bảng
                </Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Col>
        <Col span={2} className="ant-menu-horizontal"></Col>
      </Row>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};

// Helper function to determine the currently selected menu item based on URL path
const getCurrentSelectedKey = (path: string): string => {
  if (path === "/") return "overview";
  if (path === "/products") return "products-list";
  // if (path.startsWith('/products/categories')) return 'products-categories';
  if (path.startsWith("/products/pricing")) return "products-pricing";
  if (path.startsWith("/products/inventory")) return "products-inventory";
  if (path.startsWith("/products")) return "products";
  if (path === "/sales") return "sales";
  if (path === "/bills") return "bills"; // Add this line to handle /bills route
  if (path === "/transactions") return "transactions-list";
  if (path.startsWith("/transactions")) return "transactions";
  if (path === "/customer") return "customer-list";
  if (path.startsWith("/staff")) return "staff-list";
  if (path.startsWith("/customer")) return "customer";
  if (path === "/reports-table") return "reports-general-table";
  if (path.startsWith("/reports")) return "reports-general";

  return "overview"; // Default to overview
};

export default MMenu;
