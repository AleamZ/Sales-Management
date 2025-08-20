import { useState } from "react";
import { List, Avatar, Modal } from "antd";
import {
  PlusCircleOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  RedoOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import "../../styles/components/itemHistoryList.scss";
import { useActivityLogDetail, useActivityLogs } from "@/hooks/useActivityLog";
import { ActivityLog } from "@/interface/activity.interface";

const actionIcon = (action: string) => {
  switch (action) {
    case "CREATE_PRODUCT":
      return <PlusCircleOutlined style={{ color: "#52c41a" }} />;
    case "IMPORT_PRODUCT":
      return <ShoppingOutlined style={{ color: "#52c41a" }} />;
    case "RETURN_ORDER_ITEM":
      return <RedoOutlined style={{ color: "tomato" }} />;
    case "UPDATE_PRODUCT":
      return <EditOutlined style={{ color: "#faad14" }} />;
    case "CREATE_ORDER":
      return <ShoppingCartOutlined style={{ color: "#1890ff" }} />;
    case "DELETE_PRODUCT":
      return <DeleteOutlined style={{ color: "#722ed1" }} />;
    case "DELETE_ORDER":
      return <DeleteOutlined style={{ color: "#ff4d4f" }} />;
    default:
      return <Avatar />;
  }
};

const generateActionText = (action: string) => {
  switch (action) {
    case "CREATE_ORDER":
      return "Tạo đợn hàng";
    case "IMPORT_PRODUCT":
      return "Nhập hàng";
    case "RETURN_ORDER_ITEM":
      return "Hoàn trả hàng";
    case "UPDATE_PRODUCT":
      return "Cập nhật sản phẩm";
    case "DELETE_PRODUCT":
      return "Xóa sản phẩm sản phẩm";
    case "CREATE_PRODUCT":
      return "Tạo sản phẩm sản phẩm";
    case "DELETE_ORDER":
      return "Xóa hóa đơn";
    default:
      return "";
  }
};

const formatValue = (value: number | null) => {
  if (value === null) return "";
  return value.toLocaleString("vi-VN") + " đ";
};

const ItemHistoryList = () => {
  const [logId, setLogId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data } = useActivityLogs();
  const { data: logDetail, isLoading } = useActivityLogDetail(logId);

  const handleItemClick = (id: string) => {
    setLogId(id);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setLogId(undefined);
  };
  return (
    <>
      <List
        className="item-history-list"
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item: ActivityLog) => (
          <List.Item
            onClick={() => handleItemClick(item._id)}
            style={{ cursor: "pointer" }}
          >
            <List.Item.Meta
              avatar={actionIcon(item.action)}
              title={
                <span>
                  <b>{item.userId?.name}</b> vừa{" "}
                  <b>{generateActionText(item.action)}</b>
                  {item?.metadata?.total !== null &&
                    ![
                      "DELETE_PRODUCT",
                      "UPDATE_PRODUCT",
                      "CREATE_PRODUCT",
                      "DELETE_ORDER",
                    ].includes(item.action) && (
                      <>
                        {" "}
                        với giá trị{" "}
                        <b>{formatValue(item?.metadata?.total ?? 0)}</b>
                      </>
                    )}
                  {item.action === "DELETE_ORDER" && item?.metadata?.originalRevenue && (
                    <>
                      {" "}
                      (Doanh thu gốc:{" "}
                      <b>{formatValue(item?.metadata?.originalRevenue ?? 0)}</b>)
                    </>
                  )}
                </span>
              }
              description={new Date(item.createdAt).toLocaleString("vi-VN")}
            />
          </List.Item>
        )}
      />
      <Modal
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        title="Chi tiết hoạt động"
      >
        {isLoading ? (
          <p>Đang tải...</p>
        ) : logDetail ? (
          <div>
            <p>
              <b>Người dùng:</b> {logDetail.userId?.name}
            </p>
            <p>
              <b>Hành động:</b> {generateActionText(logDetail?.action)}
            </p>
            <p>
              <b>Nội dung:</b> {logDetail?.message}
            </p>

            <p>
              <b>Thời gian:</b>{" "}
              {new Date(logDetail?.createdAt).toLocaleString("vi-VN")}
            </p>

            {["DELETE_PRODUCT", "UPDATE_PRODUCT", "CREATE_PRODUCT"].includes(
              logDetail.action
            ) ? (
              <>
                <p>
                  <b>Mã sản phẩm:</b> {typeof logDetail?.refId === 'object' ? (logDetail?.refId as any)?._id || (logDetail?.refId as any)?.barcode : logDetail?.refId}
                </p>
                <p>
                  <b>Số sản phẩm:</b> {logDetail?.metadata?.productCount}
                </p>
              </>
            ) : logDetail.action === "DELETE_ORDER" ? (
              <>
                <p>
                  <b>Mã đơn hàng:</b> {typeof logDetail?.refId === 'object' ? (logDetail?.refId as any)?._id : logDetail?.refId}
                </p>
                <p>
                  <b>Số sản phẩm:</b> {logDetail?.metadata?.productCount}
                </p>
                <p>
                  <b>Doanh thu gốc:</b>{" "}
                  {formatValue(logDetail?.metadata?.originalRevenue ?? 0)}
                </p>
                <p>
                  <b>Chi phí gốc:</b>{" "}
                  {formatValue(logDetail?.metadata?.originalCostPrice ?? 0)}
                </p>
                <p>
                  <b>Tổng tiền đơn hàng:</b>{" "}
                  {formatValue(logDetail?.metadata?.totalAmount ?? 0)}
                </p>
              </>
            ) : (
              logDetail.metadata && (
                <>
                  <p>
                    <b>Tổng tiền:</b>{" "}
                    {formatValue(logDetail?.metadata?.total ?? 0)}
                  </p>
                  <p>
                    <b>Số sản phẩm:</b> {logDetail?.metadata?.productCount}
                  </p>
                </>
              )
            )}
          </div>
        ) : (
          <p>Không tìm thấy chi tiết log.</p>
        )}
      </Modal>
    </>
  );
};

export default ItemHistoryList;
