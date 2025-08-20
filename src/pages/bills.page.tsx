import { useState } from "react";
import FilterBox from "@/components/basicUI/FilterBox";
import TimeFilterPopup, {
  TimeRange,
} from "@/components/basicUI/TimeFilterPopup";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Table,
  Tag,
  Typography,
  Spin,
  Alert,
  Descriptions,
  Space,
  Popconfirm,
} from "antd";
import { OrderService } from "@/services/order.service";
import { useCustomerDept, useOrders, useReturnOrder, useDeleteOrder } from "@/hooks/useOrders";
import { OrderDetail, OrderProduct } from "@/interface/order.interface";

import { Col } from "antd";
import Loader from "@/components/basicUI/loading";
import { decodeToken } from "@/utils/jwt.utils";
import TextArea from "antd/es/input/TextArea";
import { useDebounce } from "@/hooks/useDebounce";
import { DeleteOutlined } from "@ant-design/icons";
const { Text } = Typography;

// Time type mapping - moved outside component for performance
const timeTypeMapping: Record<string, TimeRange> = {
  "today": {
    key: "today",
    label: "Hôm nay",
    type: "day",
    value: "today",
  },
  "yesterday": {
    key: "yesterday",
    label: "Hôm qua",
    type: "day",
    value: "yesterday",
  },
  "this_week": {
    key: "thisWeek",
    label: "Tuần này",
    type: "day",
    value: "this_week",
  },
  "last_week": {
    key: "lastWeek",
    label: "Tuần trước",
    type: "day",
    value: "last_week",
  },
  "this_month": {
    key: "thisMonth",
    label: "Tháng này",
    type: "month",
    value: "this_month",
  },
  "last_month": {
    key: "lastMonth",
    label: "Tháng trước",
    type: "month",
    value: "last_month",
  },
  "last_3_months": {
    key: "last3Months",
    label: "3 tháng gần đây",
    type: "month",
    value: "last_3_months",
  },
  "last_6_months": {
    key: "last6Months",
    label: "6 tháng gần đây",
    type: "month",
    value: "last_6_months",
  },
  "this_year": {
    key: "thisYear",
    label: "Năm nay",
    type: "year",
    value: "this_year",
  },
  "last_year": {
    key: "lastYear",
    label: "Năm trước",
    type: "year",
    value: "last_year",
  },
  "all": {
    key: "all",
    label: "Tất cả thời gian",
    type: "year",
    value: "all",
  },
};

const BillsPage = () => {
  const staff = decodeToken(localStorage.getItem("accessToken") || "");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [timeType, setTimeType] = useState<string>("this_month");
  const [selectedOrder, setSelectedOrder] = useState<any | null>({});
  const [selectedStatusPayments, setSelectedStatusPayments] = useState<
    string[]
  >([]);
  const { mutate: returnOrder } = useReturnOrder();
  const { mutate: customerDept } = useCustomerDept();
  const { mutate: deleteOrder } = useDeleteOrder();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [openCustomerPaid, setOpenCustomerPaid] = useState<boolean>(false);
  const debounceText = useDebounce(searchText, 500);

  // Add states for expandable functionality
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [expandLoading, setExpandLoading] = useState<Record<string, boolean>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<string, OrderDetail>>({});

  const params = {
    keyword: debounceText,
    page: page,
    limit: pageSize,
    timeType: timeType,
    status: selectedStatusPayments,
  };

  const { isLoading, data } = useOrders(params);

  const onCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        returnOrder(
          {
            orderId: selectedOrder._id,
            payload: {
              staffId: staff.userId,
              itemOrder: selectedOrder.productList.map((item: any) => ({
                productId: item.productId,
                typeProduct: Number(item.typeProduct),
                name: item.name,
                quantity: item.quantity,
                serial: item.serial ?? null,
                variableId: item.variableId ?? null,
              })),
              refund: {
                money: values.money,
                reason: values.reason,
              },
            },
          },
          {
            onSuccess: () => message.success("Hoàn đơn hàng thành công"),
            onError: () => message.error("Lỗi hệ thống vui lòng thử lại sau"),
          }
        );
        setOpen(false);
        setSelectedOrder(null);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const getDefaultTimeRange = (): TimeRange => {
    // Return the matching TimeRange or default to "this_month"
    return timeTypeMapping[timeType] || timeTypeMapping["this_month"];
  };

  const handleExportBill = async (record: any) => {
    try {
      setLoading(true);
      const response = await OrderService.exportInvoice(record._id);
      const blob = new Blob([response], { type: "application/pdf" });

      // Tạo URL tạm
      const pdfUrl = URL.createObjectURL(blob);

      // Mở tab mới hiển thị PDF
      window.open(pdfUrl, "_blank");
    } catch {
      message.error("Vui lòng bạn xuất lại, hiện hệ thống đang xuất lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnOrder = (record: any) => {
    setSelectedOrder(record);
    setOpen(true);
  };

  const handleCustomerPaid = (record: any) => {
    setSelectedOrder(record);
    setOpenCustomerPaid(true);
  };

  const handleConfrimCustomerPaid = () => {
    form.validateFields().then((values) => {
      customerDept(
        {
          money: values.money,
          orderId: selectedOrder._id,
        },
        {
          onSuccess: () => message.success("Thành công"),
          onError: () => message.error("Lỗi hệ thống vui lòng thử lại sau"),
        }
      );
      setOpenCustomerPaid(false);
      setSelectedOrder(null);
      form.resetFields();
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(
      {
        orderId: orderId,
        userId: staff.userId,
      },
      {
        onSuccess: () => message.success("Xóa đơn hàng thành công"),
        onError: () => message.error("Lỗi hệ thống vui lòng thử lại sau"),
      }
    );
  };

  // Add handleExpand function
  const handleExpand = async (expanded: boolean, record: any) => {
    if (!record) return;

    const recordKey = record._id;

    if (expanded) {
      setExpandedRowKeys([recordKey]);

      if (expandedOrders[recordKey]) {
        return;
      }

      setExpandLoading((prev) => ({ ...prev, [recordKey]: true }));

      try {
        const response = await OrderService.getOrderById(recordKey);
        if (response && response.data) {
          setExpandedOrders((prev) => ({
            ...prev,
            [recordKey]: response.data,
          }));
        } else {
          message.error("Không thể tải chi tiết đơn hàng");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        message.error("Lỗi khi tải chi tiết đơn hàng");
      } finally {
        setExpandLoading((prev) => ({ ...prev, [recordKey]: false }));
      }
    } else {
      setExpandedRowKeys([]);
    }
  };

  // Add renderExpandedRow function
  const renderExpandedRow = (record: any) => {
    if (!record) {
      return (
        <Alert
          message="Không có dữ liệu đơn hàng để hiển thị chi tiết."
          type="warning"
        />
      );
    }

    const recordKey = record._id;
    const isLoading = expandLoading[recordKey];
    const detailedOrder = expandedOrders[recordKey];

    if (isLoading) {
      return <Spin tip="Đang tải chi tiết đơn hàng..." />;
    }

    if (!detailedOrder) {
      return (
        <Alert
          message="Không thể tải chi tiết đơn hàng"
          type="warning"
        />
      );
    }

    const formatCurrency = (amount?: number) => {
      if (amount === undefined) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    return (
      <div style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Descriptions
            title="Thông tin đơn hàng"
            bordered
            column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Mã đơn hàng">{detailedOrder._id}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{detailedOrder.customerName}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{detailedOrder.customerPhone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>{detailedOrder.customerAddress}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(detailedOrder.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>

          <Table
            title={() => <Text strong>Danh sách sản phẩm</Text>}
            dataSource={detailedOrder.productList}
            rowKey="_id"
            pagination={false}
            size="small"
            columns={[
              {
                title: "Tên sản phẩm",
                dataIndex: "name",
                width: "35%",
              },
              {
                title: "Mã SP",
                dataIndex: "barcode",
                width: "15%",
                render: (barcode: string | null) => barcode || "N/A",
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
                width: "15%",
                align: 'right' as const,
              },
              {
                title: "Đơn giá",
                dataIndex: "sellPrice",
                width: "15%",
                align: 'right' as const,
                render: (price: number) => formatCurrency(price),
              },
              {
                title: "Thành tiền",
                width: "20%",
                align: 'right' as const,
                render: (_, record: OrderProduct) => formatCurrency(record.sellPrice * record.quantity),
              },
            ]}
            summary={(data: readonly OrderProduct[]) => {
              const total = data.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <Text strong>Tổng tiền hàng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{formatCurrency(total)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {detailedOrder.discountValue > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Giảm giá:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong type="danger">
                          {detailedOrder.discountType === "percent"
                            ? `${detailedOrder.discountValue}%`
                            : formatCurrency(detailedOrder.discountValue)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <Text strong>Tổng thanh toán:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong type="success">{formatCurrency(detailedOrder.totalAmount)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <Text strong>Đã thanh toán:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{formatCurrency(detailedOrder.customerPaid)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {detailedOrder.customerDebt > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong type="danger">Còn nợ:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong type="danger">{formatCurrency(detailedOrder.customerDebt)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                </>
              );
            }}
          />

          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button onClick={() => handleExportBill(record)} disabled={detailedOrder.isReturnOrder}>
              Xuất hóa đơn
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => handleReturnOrder(record)}
              disabled={detailedOrder.isReturnOrder}
            >
              Hoàn đơn hàng
            </Button>
            <Button
              style={{
                backgroundColor: detailedOrder.customerDebt === 0 ? "#0000000a" : "green",
                color: detailedOrder.customerDebt === 0 ? "#00000040" : "white",
              }}
              onClick={() => handleCustomerPaid(record)}
              disabled={Number(detailedOrder.customerDebt) === 0}
            >
              Trả nợ
            </Button>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa đơn hàng này?"
              onConfirm={() => handleDeleteOrder(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      </div>
    );
  };

  // Table columns definition
  const columns = [
    {
      title: "Thời Gian",
      dataIndex: "createdAt",
      width: "18%",
      render: (text: string) => {
        const date = new Date(text);
        return (
          <Text>
            {date.toLocaleDateString("vi-VN")}{" "}
            {date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        );
      },
    },
    {
      title: "Khách Hàng",
      dataIndex: "customerName",
      width: "22%",
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      width: "18%",
      align: 'right' as const,
      render: (amount: number) => (
        <Text>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount)}
        </Text>
      ),
    },
    {
      title: "Đã Thanh Toán",
      dataIndex: "customerPaid",
      width: "18%",
      align: 'right' as const,
      render: (paid: number) => (
        <Text>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(paid)}
        </Text>
      ),
    },
    {
      title: "Còn nợ",
      dataIndex: "customerDebt",
      width: "18%",
      align: 'right' as const,
      render: (debt: number) => (
        <Text type={debt > 0 ? "danger" : undefined}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(debt)}
        </Text>
      ),
    },
    {
      title: "Trạng Thái",
      key: "paymentStatus",
      width: "24%",
      align: 'center' as const,
      render: (_: any, record: { paymentStatus: "paid" | "partial" | "unpaid" | "paid_refund" }) => {
        const paymentStatus = record.paymentStatus;
        let color = "error";
        let text = "Chưa thanh toán";

        if (paymentStatus === "paid") {
          color = "green";
          text = "Đã thanh toán";
        } else if (paymentStatus === "partial") {
          color = "warning";
          text = "Còn nợ";
        } else if (paymentStatus === "paid_refund") {
          color = "gold";
          text = "Hoàn trả hàng";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const optionStatusOrer = [
    { label: "Đã thanh toán", value: "paid" },
    { label: "Chưa thanh toán", value: "unpaid" },
    { label: "Còn nợ", value: "partial" },
    { label: "Hoàn đơn", value: "paid_refund" },
  ];

  const onChange = (checkedValues: string[]) => {
    setSelectedStatusPayments(checkedValues);
  };
  if (isLoading || loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="isDesktop">
        <Col span={24} className="bills-page">
          <Col span={4} className="bills-page__left">
            <div className="bills-page__left__title ">Hóa Đơn</div>
            <div className="bills-page__left__filter">
              <FilterBox title="Thời Gian">
                <TimeFilterPopup
                  onChange={(value) => setTimeType(value)}
                  value={getDefaultTimeRange()}
                />
              </FilterBox>

              <FilterBox title="Trạng thái đơn hàng">
                <Checkbox.Group
                  style={{ width: "100%" }}
                  value={selectedStatusPayments}
                  onChange={onChange}
                >
                  {optionStatusOrer.map((option) => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      style={{
                        display: "flex",
                        width: "100%",
                        marginBottom: 8,
                      }}
                    >
                      {option.label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </FilterBox>
            </div>
          </Col>
          <Col span={20} className="bills-page__right">
            <div className="bills-page__right__search">
              <Input.Search
                placeholder="Tìm kiếm hóa đơn theo mã, khách hàng..."
                style={{ width: 300 }}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="bills-page__right__table">
              <Table
                dataSource={data?.data ?? []}
                columns={columns}
                rowKey="_id"
                pagination={{
                  current: page,
                  total: data?.attrs?.totalCount,
                  pageSize: pageSize,
                  onChange: (newPage) => setPage(newPage),
                  onShowSizeChange: (_current, size) => {
                    setPageSize(size);
                    setPage(1); // Reset to first page when changing page size
                  },
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} hóa đơn`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                bordered={true}
                size="middle"
                className="bills-table"
                style={{ width: '100%' }}
                rowClassName={(_, index) =>
                  index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
                locale={{ emptyText: "Không có hóa đơn nào" }}
                expandable={{
                  expandedRowRender: renderExpandedRow,
                  onExpand: handleExpand,
                  expandedRowKeys: expandedRowKeys,
                  expandRowByClick: true,
                }}
              />
            </div>
          </Col>
        </Col>
        <Modal
          open={open}
          title="Hoàn tiền đơn hàng"
          onCancel={() => {
            form.resetFields();
            onCancel();
          }}
          footer={[
            <Button key="cancel" onClick={onCancel}>
              Huỷ
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleOk}
            >
              Xác nhận hoàn
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Số tiền hoàn"
              name="money"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền hoàn" },
                { type: "number", min: 0, message: "Số tiền không hợp lệ" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>

            <Form.Item
              label="Lý do hoàn tiền"
              name="reason"
              rules={[
                { required: true, message: "Vui lòng nhập lý do hoàn tiền" },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          open={openCustomerPaid}
          title="Khách hàng trả tiền"
          footer={[
            <Button key="cancel" onClick={() => setOpenCustomerPaid(false)}>
              Huỷ
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleConfrimCustomerPaid}
            >
              Xác nhận
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Số tiền trả"
              name="money"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền hoàn" },
                { type: "number", min: 0, message: "Số tiền không hợp lệ" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default BillsPage;
