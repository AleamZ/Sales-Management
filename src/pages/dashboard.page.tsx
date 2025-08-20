import React from "react";
import { Layout } from "antd";
import SalesResultsTodayDashboard from "../components/dashboard/salesResultsToday.dashboard";
import ColumnChartDashboard from "../components/dashboard/columnChart.dashboard";
import TopSellProductDashboard from "../components/dashboard/topSellProduct.dashboard";
import TakeCareCustomerDashboard from "../components/dashboard/TakeCareCustomer.dashboard";
import HistoryActionDashboard from "../components/dashboard/historyAction.dashboard";
import { Col, Row } from "antd";
import SalesResultsYear from "@/components/dashboard/salesResultsYear";
const { Content } = Layout;

const Dashboard: React.FC = () => {
  return (
    <Layout className="dashboard-page">
      <Content
        className="dashboard-page-dashboard-content"
        style={{ padding: "24px" }}
      >
        <Row className="dashboard-content-row">
          <Col className="dashboard-content-col-left" span={19}>
            <SalesResultsTodayDashboard />
            <ColumnChartDashboard />

            <SalesResultsYear />
            {/* Add more dashboard components here */}
            <TopSellProductDashboard />
          </Col>
          <Col className="dashboard-content-col-right" span={5}>
            <TakeCareCustomerDashboard />
            <HistoryActionDashboard />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;
