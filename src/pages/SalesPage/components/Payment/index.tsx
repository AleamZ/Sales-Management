import { Dispatch, SetStateAction, useState } from "react";
import {
  Input,
  Button,
  Row,
  Col,
  Typography,
  message,
  InputNumber,
  Modal,
  Form,
  DatePicker,
} from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useCustomerQuery } from "@/hooks/useCustomer";
import { useDebounce } from "@/hooks/useDebounce";
import { decodeToken } from "@/utils/jwt.utils";
import { useCreateOrder } from "@/hooks/useOrders";
import { formatNumber } from "../../utils/calculate";
import { createCustomer } from "@/services/customer.service";

const { Text } = Typography;
interface PaymentProps {
  totalAmount: number;
  listProducts: any[];
  setCartsProduct: Dispatch<SetStateAction<any[]>>;
}
interface ICustomer {
  _id: string;
  name: string;
  phone: string;
  address: string;
}
type TypeDiscount = "percent" | "money";
const PaymentLayout = ({
  totalAmount,
  listProducts,
  setCartsProduct,
}: PaymentProps) => {
  const staff = decodeToken(localStorage.getItem("accessToken") || "");
  const [search, setSearch] = useState<string>("");
  const valueSearch = useDebounce(search, 500);
  const [discount, setDiscount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer>({
    _id: "",
    name: "",
    phone: "",
    address: "",
  });
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [typeDiscount, setTypeDiscount] = useState<TypeDiscount>("money");
  const [saleDate, setSaleDate] = useState(dayjs());

  const { data } = useCustomerQuery(valueSearch);
  const { mutate: createOrder } = useCreateOrder();
  const caculateToPay = () => {
    if (typeDiscount === "money") {
      return totalAmount - discount;
    }
    if (typeDiscount === "percent") {
      return totalAmount - (totalAmount * discount) / 100;
    }
    return 0;
  };
  const caculateToDiscount = () => {
    if (discount === 0) {
      return 0;
    }
    if (typeDiscount === "money") {
      return totalAmount - discount;
    }
    if (typeDiscount === "percent") {
      return totalAmount - (totalAmount * discount) / 100;
    }
    return 0;
  };
  const handlePayment = () => {
    if (!selectedCustomer) {
      return message.warning("Vui lòng chọn khách hàng");
    }
    if (!listProducts.length) {
      return message.warning("Bạn chưa chọn sản phẩm");
    }

    const payloadOrder = {
      staffId: staff?.userId ?? staff?.sub ?? "demo-user",
      customerId: selectedCustomer?._id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      customerAddress: selectedCustomer?.address,
      productList: listProducts,
      discountType: typeDiscount,
      discountValue: discount,
      totalAmount: totalAmount,
      totalAmountDiscount: caculateToDiscount(),
      customerPaid: amountPaid,
      saleDate: saleDate.toISOString(),
    };
    createOrder(payloadOrder, {
      onSuccess: () => {
        message.success("Tạo đơn thành công");
        setSelectedCustomer({
          _id: "",
          name: "",
          phone: "",
          address: "",
        });
        setCartsProduct([]);
        setAmountPaid(0);
        setDiscount(0);
        setSaleDate(dayjs());
      },
      onError: (error) => {
        message.error(error.message || "Lỗi tạo đơn hàng");
      },
    });
  };
  const changeMoney = amountPaid - caculateToPay();

  const handleAddCustomer = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const response = await createCustomer({
        name: values.name,
        phone: values.phone,
        address: values.address,
        email: values.email,
      });

      if (response.ok) {
        message.success("Thêm khách hàng thành công");
        setSelectedCustomer({
          _id: response.data._id,
          name: response.data.name,
          phone: response.data.phone || "",
          address: response.data.address || "",
        });
        setIsModalOpen(false);
        form.resetFields();
      }
    } catch (error: any) {
      message.error(error.message || "Lỗi khi thêm khách hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        maxWidth: "100%",
        margin: "0 auto",
        borderRadius: 8,
        boxShadow: "0 0 6px rgba(0,0,0,0.1)",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Text>
          <b>Nhân viên:</b> {staff?.name ?? "N/A"}{" "}
          <Text type="secondary">({staff?.role ?? "STAFF"})</Text>
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined />
          <Text style={{ marginRight: 8, fontWeight: 500 }}>Ngày bán:</Text>
          <DatePicker
            value={saleDate}
            onChange={(date) => {
              if (!date) {
                setSaleDate(dayjs());
                return;
              }

              // Nếu chọn ngày hiện tại, giữ nguyên giờ hiện tại
              const today = dayjs();
              if (date.isSame(today, 'day')) {
                setSaleDate(today);
              } else {
                // Nếu chọn ngày khác, đặt giờ 01:00
                setSaleDate(date.hour(1).minute(0).second(0).millisecond(0));
              }
            }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày bán"
            allowClear={false}
            style={{ width: 140 }}
          />
        </div>
      </Row>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm khách hàng (tên, SĐT)"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          addonAfter={
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ border: 'none', padding: 0, marginRight: -8 }}
            />
          }
        />

        {search && (
          <div
            style={{
              position: "absolute",
              background: "#fff",
              width: "96%",
              borderRadius: 4,
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 6,
              paddingRight: 6,
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            {data?.map((item) => (
              <div
                style={{
                  cursor: "pointer",
                  padding: "12px",
                  border: "1px solid black",
                  borderRadius: 4,
                  maxWidth: 600,
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  textAlign: "start",
                }}
                onClick={() => {
                  setSelectedCustomer({
                    _id: item._id,
                    address: item.address ?? "",
                    phone: item.phone ?? "",
                    name: item.name,
                  });
                  setSearch("");
                }}
              >
                <div>
                  <strong>{item.name}</strong> - <strong>{item.phone}</strong>
                </div>
                <div>
                  {" "}
                  <small>{item.address}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedCustomer && (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 12 }}
        >
          <Text>
            <b>Khách hàng:</b>
          </Text>
          <Text strong style={{ fontSize: 16 }}>
            {selectedCustomer?.name} - {selectedCustomer?.phone}
          </Text>
        </Row>
      )}
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Text>
          <b>Tổng tiền hàng:</b>
        </Text>
        <Text strong style={{ fontSize: 16 }}>
          {totalAmount.toLocaleString()} đ
        </Text>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text>Giảm giá:</Text>
        </Col>
        <Col span={12} style={{ display: "flex", gap: 6 }}>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            suffix={typeDiscount === "money" ? "đ" : "%"}
          />
          <Button
            onClick={() =>
              setTypeDiscount(typeDiscount === "money" ? "percent" : "money")
            }
          >
            {typeDiscount === "money" ? "Giảm theo %" : "Giảm theo tiền"}
          </Button>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text>
            <b>Khách cần trả:</b>
          </Text>
        </Col>
        <Col span={12}>
          <Text strong style={{ color: "red", fontSize: 16 }}>
            {caculateToPay().toLocaleString()} đ
          </Text>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Text>Khách thanh toán:</Text>
        </Col>
        <Col span={12}>
          <InputNumber
            style={{ width: "100%" }}
            value={formatNumber(amountPaid)}
            onChange={(value) => setAmountPaid(Number(value))}
            suffix={"đ"}
          />
        </Col>
      </Row>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Text>
            <b>Tiền thừa trả khách:</b>
          </Text>
        </Col>
        <Col span={12}>
          <Text style={{ color: "red", fontWeight: "bold", fontSize: "16px" }}>
            {changeMoney.toLocaleString()} đ
          </Text>
        </Col>
      </Row>

      <Button
        type="primary"
        block
        style={{ height: 40, fontWeight: "bold" }}
        onClick={handlePayment}
      >
        Thanh Toán
      </Button>

      <Modal
        title="Thêm khách hàng mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleAddCustomer}
          >
            Thêm
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentLayout;
