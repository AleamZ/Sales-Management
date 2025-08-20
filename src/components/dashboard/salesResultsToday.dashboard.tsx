import { Row, Col } from "antd";
import {
  DollarCircleOutlined,
  DownCircleOutlined,
  UpCircleOutlined
} from "@ant-design/icons";
import Results from "../basicUI/results";
import Loader from "../basicUI/loading";
import { formatCurrency } from "../../utils/formatCurrency.util";
import { useReveunes } from "@/hooks/useDashboard";
const SalesResultsTodayDashboard = () => {
  const { data, isLoading } = useReveunes();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="sales-results-today-dashboard">
      <div className="title">Kết quả bán hàng hôm nay</div>
      <Row gutter={24}>
        <Col span={8}>
          <Results
            title={"Doanh thu"}
            value={formatCurrency(Number(data?.value ?? 0))}
            subValue={`${data?.totalBill ?? 0} hóa đơn có doanh thu`}
            titleSubValue="Số lượng hóa đơn"
            extraInfo={`Tổng: ${data?.totalOrders ?? 0} | Chuẩn: ${data?.totalNormalOrders ?? 0} | Hoàn: ${data?.totalReturnedOrders ?? 0}`}
            icon={
              <DollarCircleOutlined
                style={{ fontSize: "24px", color: "#1890ff" }}
              />
            }
          />
        </Col>

        <Col span={8}>
          <Results
            title={"So với hôm qua"}
            value={`${data?.compareWithYesterday ?? 0}%`}
            subValue={`Doanh thu thực tế: ${data?.compareActualWithYesterday ?? 0}%`}
            titleSubValue="So sánh"
            icon={
              data.compareWithYesterday > 0 ? (
                <UpCircleOutlined
                  style={{ fontSize: "24px", color: "#52c41a" }}
                />
              ) : (
                <DownCircleOutlined
                  style={{ fontSize: "24px", color: "#f5222d" }}
                />
              )
            }
          />
        </Col>
        <Col span={8}>
          <Results
            title={"So với tháng trước"}
            value={`${data?.compareWithMonth ?? 0}%`}
            subValue={`Doanh thu thực tế: ${data?.compareActualWithMonth ?? 0}%`}
            titleSubValue="So sánh"
            icon={
              data?.compareWithMonth !== undefined ? (
                data.compareWithMonth > 0 ? (
                  <UpCircleOutlined
                    style={{ fontSize: "24px", color: "#52c41a" }}
                  />
                ) : (
                  <DownCircleOutlined
                    style={{ fontSize: "24px", color: "#f5222d" }}
                  />
                )
              ) : null
            }
          />
        </Col>
      </Row>
    </div >
  );
};

export default SalesResultsTodayDashboard;
