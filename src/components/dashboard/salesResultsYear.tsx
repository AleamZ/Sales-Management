import { useState } from "react";
import { DatePicker, Row } from "antd";
import { RightCircleFilled } from "@ant-design/icons";
import { formatCurrency } from "../../utils/formatCurrency.util";
import RevenueBarChart from "../dashboard/RevenueBarChart.dashboard";
import { useRevenueByYear } from "@/hooks/useDashboard";
import dayjs from "dayjs";

const SalesResultsYear = () => {
  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data } = useRevenueByYear(selectedYear);

  const onChange = (date: any, dateString: any) => {
    console.log({ date });
    const year = parseInt(dateString);
    setSelectedYear(year);
  };

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
    <div className="column-chart-dashboard">
      <Row className="column-chart-dashboard-top">
        <Row className="column-chart-dashboard-top-left">
          <div className="title">Doanh thu năm {selectedYear}</div>
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

        <DatePicker
          picker="year"
          onChange={onChange}
          defaultValue={dayjs(`${currentYear}`, "YYYY")}
        />
      </Row>

      <div className="chart-container">
        <div className="chart-time-unit">
          <RevenueBarChart
            data={transformChartData(data?.monthGroups ?? [])}
            showProfit={true}
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesResultsYear;
