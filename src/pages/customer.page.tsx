import FilterBox from "@/components/basicUI/FilterBox";
import {
  Button,
  Col,
  Input,
  Row,
  Table,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import {
  Customer,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  CustomerCreateDto,
  CustomerUpdateDto,
} from "@/services/customer.service";

const CustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const debouncedSetSearch = useCallback(
    debounce((text: string) => {
      setDebouncedSearchText(text);
    }, 500),
    []
  );
  //s
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSetSearch(value);
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearchText) params.keyword = debouncedSearchText;

      const response = await getAllCustomers(debouncedSearchText);
      if (response.ok) {
        setCustomers(response.data);
        setTotalCustomers(response.data.length); // If your API provides a total count, use that instead
      } else {
        message.error("Lỗi khi tải dữ liệu khách hàng");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Không thể tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch customers when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearchText, currentPage, pageSize]);

  // Add customer
  const handleAddCustomer = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const handleAddModalOk = async () => {
    try {
      const values = await form.validateFields();
      const customerData: CustomerCreateDto = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        notes: values.notes,
      };

      const response = await createCustomer(customerData);
      if (response.ok) {
        message.success("Thêm khách hàng thành công");
        setIsAddModalVisible(false);
        fetchCustomers();
      } else {
        message.error("Lỗi khi thêm khách hàng");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  // Edit customer
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
  };

  const handleEditModalOk = async () => {
    if (!currentCustomer) return;

    try {
      const values = await editForm.validateFields();
      const customerData: CustomerUpdateDto = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        notes: values.notes,
      };

      const response = await updateCustomer(currentCustomer._id, customerData);
      if (response.ok) {
        message.success("Cập nhật khách hàng thành công");
        setIsEditModalVisible(false);
        fetchCustomers();
      } else {
        message.error("Lỗi khi cập nhật khách hàng");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  // Delete customer
  const handleDeleteCustomer = (customerId: string) => {
    Modal.confirm({
      title: "Xác nhận xóa khách hàng",
      content: "Bạn có chắc chắn muốn xóa khách hàng này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await deleteCustomer(customerId);
          if (response.ok) {
            message.success("Xóa khách hàng thành công");
            fetchCustomers();
          } else {
            message.error("Lỗi khi xóa khách hàng");
          }
        } catch (error) {
          console.error("Error deleting customer:", error);
          message.error("Không thể xóa khách hàng");
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã Khách Hàng",
      dataIndex: "_id",
      key: "_id",
      width: 150,
      render: (id: string) => <span>{id.slice(-6).toUpperCase()}</span>,
    },
    {
      title: "Tên Khách Hàng",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Điện Thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Địa Chỉ",
      dataIndex: "address",
      key: "address",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (address: string) => (
        <Tooltip placement="topLeft" title={address}>
          {address || "N/A"}
        </Tooltip>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: unknown, record: Customer) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCustomer(record)}
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteCustomer(record._id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Col span={24}>
        <Row className="customer-main-content">
          <Col
            span={4}
            className="customer-page__left"
            style={{ paddingLeft: "10px", paddingRight: "10px" }}
          >
            <div className="customer-page__left__title">Khách Hàng</div>
            <div className="customer-page__left__filter">
              <FilterBox title="Phân Loại">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Button
                    type="text"
                    style={{ textAlign: "left", padding: "4px 8px" }}
                    onClick={() => {
                      setDebouncedSearchText("");
                      setSearchText("");
                      fetchCustomers();
                    }}
                  >
                    Tất cả khách hàng
                  </Button>
                  <Button
                    type="text"
                    style={{ textAlign: "left", padding: "4px 8px" }}
                    onClick={() => {
                      // Filter logic for VIP customers would go here
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Khách hàng VIP
                  </Button>
                  <Button
                    type="text"
                    style={{ textAlign: "left", padding: "4px 8px" }}
                    onClick={() => {
                      // Filter logic for new customers
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Khách hàng mới
                  </Button>
                </div>
              </FilterBox>
              <FilterBox title="Trạng Thái">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Button
                    type="text"
                    style={{ textAlign: "left", padding: "4px 8px" }}
                    onClick={() => {
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Đang hoạt động
                  </Button>
                  <Button
                    type="text"
                    style={{ textAlign: "left", padding: "4px 8px" }}
                    onClick={() => {
                      message.info("Tính năng đang phát triển");
                    }}
                  >
                    Không hoạt động
                  </Button>
                </div>
              </FilterBox>
            </div>
          </Col>
          <Col span={20} className="customer-page__right">
            <div className="customer-page__right__top-row">
              <div className="customer-page__right__search">
                <Input.Search
                  placeholder="Tìm kiếm khách hàng theo tên, SĐT, email..."
                  style={{ width: 350 }}
                  allowClear
                  value={searchText}
                  onChange={handleSearchChange}
                  onSearch={setDebouncedSearchText}
                  prefix={<SearchOutlined />}
                  loading={loading}
                />
              </div>
              <div className="customer-page__right__button">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCustomer}
                >
                  Thêm Khách Hàng
                </Button>
              </div>
            </div>
            <div className="customer-page__right__table">
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin tip="Đang tải dữ liệu khách hàng..." />
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={customers}
                  rowKey="_id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalCustomers,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      if (pageSize) setPageSize(pageSize);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} / ${total} khách hàng`,
                  }}
                  scroll={{ x: "max-content", y: 500 }}
                  bordered={false}
                  className="customer-table"
                  rowClassName={(_, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                  }
                  locale={{ emptyText: "Không có khách hàng nào" }}
                />
              )}
            </div>
          </Col>
        </Row>
      </Col>

      {/* Add Customer Modal */}
      <Modal
        title="Thêm Khách Hàng"
        open={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea placeholder="Nhập ghi chú" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        title="Sửa Thông Tin Khách Hàng"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea placeholder="Nhập ghi chú" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerPage;
