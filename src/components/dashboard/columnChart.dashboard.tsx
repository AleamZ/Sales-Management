import React from "react";
import { Row, Select, Tabs } from "antd";
import { RightCircleFilled } from "@ant-design/icons";
import { formatCurrency } from "../../utils/formatCurrency.util";
import RevenueBarChart from "../dashboard/RevenueBarChart.dashboard";
import { useRevenueByTimeType } from "@/hooks/useDashboard";

const ColumnChartDashboard = () => {
  const timePeriodOptions = {
    TODAY: "hôm nay",
    YESTERDAY: "hôm qua",
    THIS_WEEK: "tuần này",
    THIS_MONTH: "tháng này",
    LAST_MONTH: "tháng trước",
  };
  const timePeriodReverseMap = Object.entries(timePeriodOptions).reduce(
    (acc, [key, value]) => {
      acc[value] = key as keyof typeof timePeriodOptions;
      return acc;
    },
    {} as Record<string, keyof typeof timePeriodOptions>
  );
  const [charthook, setChartHook] = React.useState<string>(
    timePeriodOptions.TODAY
  );
  const handleTimePeriodChange = (value: string) => {
    setChartHook(value);
  };
  const queryTimeType = timePeriodReverseMap[charthook];
  const { data } = useRevenueByTimeType(queryTimeType);

  const transformChartData = (data: any[]) => {
    return (
      data?.map((item) => ({
        date: item.date,
        revenue: item.revenue,
        profit: item.profit,
      })) ?? []
    );
  };

  return (
    <>
      <div className="column-chart-dashboard">
        <Row className="column-chart-dashboard-top">
          <Row className="column-chart-dashboard-top-left">
            <div className="title">Doanh thu {charthook}</div>
            <div className="icon_totalRevenue">
              <RightCircleFilled className="icon" />
              <div className="totalRevenue">
                {formatCurrency(data?.totalRevenue ?? 0)}
              </div>
            </div>
            <div className="icon_totalProfit">
              <RightCircleFilled className="icon" />
              <div className="totalProfit">
                Lợi nhuận: {formatCurrency(data?.totalProfit ?? 0)}
              </div>
            </div>

          </Row>

          <Select
            className="select-time-period"
            value={charthook}
            onChange={handleTimePeriodChange}
          >
            {Object.entries(timePeriodOptions).map(([key, value]) => (
              <Select.Option key={key} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Row>

        <div className="chart-container">
          <div className="chart-time-unit">
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Ngày" key="1">
                <RevenueBarChart
                  data={transformChartData(data?.chartDay)}
                  showProfit={true}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Giờ" key="2">
                <RevenueBarChart
                  data={transformChartData(data?.chartHour)}
                  showProfit={true}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Thứ" key="3">
                <RevenueBarChart
                  data={transformChartData(data?.chartWeek)}
                  showProfit={true}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default ColumnChartDashboard;
