import React from "react";
import { Row, Select, Tabs } from "antd";
import TopTenRevenueBarChart from "../dashboard/TopTenRevenueBarChart.dashboard";
import { useTopProductsByQuantityAndRevenue } from "@/hooks/useDashboard";

const TopSellProductDashboard = () => {
  const timePeriodOptions = {
    TODAY: "hôm nay",
    YESTERDAY: "hôm qua",
    THIS_WEEK: "tuần này",
    THIS_MONTH: "tháng này",
    LAST_MONTH: "tháng trước",
  };
  const [charthook, setChartHook] = React.useState<string>(
    timePeriodOptions.TODAY
  );
  const handleTimePeriodChange = (value: string) => {
    setChartHook(value);
  };

  const timePeriodReverseMap = Object.entries(timePeriodOptions).reduce(
    (acc, [key, value]) => {
      acc[value] = key as keyof typeof timePeriodOptions;
      return acc;
    },
    {} as Record<string, keyof typeof timePeriodOptions>
  );
  const queryTimeType = timePeriodReverseMap[charthook];

  const { data, isLoading, error, isError } = useTopProductsByQuantityAndRevenue(queryTimeType);

  return (
    <div className="column-chart-dashboard">
      <Row className="column-chart-dashboard-top">
        <Row className="column-chart-dashboard-top-left">
          <div className="title">Top 10 Hàng Hóa Bán Chạy {charthook}</div>
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
        {isLoading && <div>Loading...</div>}
        {isError && <div>Error: {error?.message || 'Unknown error'}</div>}
        {!isLoading && !isError && (
          <div className="chart-time-unit">
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Theo Doanh Thu" key="1">
                <TopTenRevenueBarChart
                  data={data?.revenue ?? []}
                  isQuantityChart={false}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Theo Số Lượng" key="2">
                <TopTenRevenueBarChart
                  data={data?.quantity ?? []}
                  isQuantityChart={true}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopSellProductDashboard;
