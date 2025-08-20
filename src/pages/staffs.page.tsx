import { useState } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import {
  useCreateStaff,
  useDeleteStaff,
  useStaffs,
  useUpdateStaff,
} from "@/hooks/useStaff";
import { RegisterRequest } from "@/services/auth.service";
const Staff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<{
    _id?: string;
    name?: string;
    email?: string;
  } | null>(null);

  const [form] = Form.useForm();
  const { mutate: createStaff } = useCreateStaff();
  const { data, isLoading } = useStaffs();
  const { mutate: deleteStaff } = useDeleteStaff();
  const { mutate: updateStaff } = useUpdateStaff();
  const openCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      name: staff.name,
      email: staff.email,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa nhân viên này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        deleteStaff(id, {
          onSuccess: () => message.success("Xóa nhân viên thành công"),
          onError: () => message.error("Xóa nhân viên thất bại"),
        });
      },
    });
  };
  const onFinish = (values: RegisterRequest) => {
    if (editingStaff) {
      updateStaff(
        { id: editingStaff?._id ?? "", payload: values },
        {
          onSuccess: () => {
            message.success("Cập nhật nhân viên thành công");
            setIsModalOpen(false);
            setEditingStaff(null);
          },
          onError: () => {
            message.error("Cập nhật thất bại");
          },
        }
      );
    } else {
      createStaff(values, {
        onSuccess: () => {
          message.success("Tạo nhân viên thành công");
          setIsModalOpen(false);
        },
        onError: () => {
          message.error("Tạo thất bại");
        },
      });
    }
  };

  const columns = [
    { title: "Tên nhân viên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button
        type="primary"
        onClick={openCreateModal}
        style={{ marginBottom: 16 }}
      >
        Tạo nhân viên mới
      </Button>
      <Table
        rowKey="id"
        dataSource={data ?? []}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingStaff ? "Cập nhật nhân viên" : "Tạo nhân viên"}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={<></>}
      >
        <Form
          name="register_form"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Họ và tên"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Emmail không đúng định dang!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          {!editingStaff && (
            <>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khâu"
                  size="large"
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              size="large"
            >
              {editingStaff ? "Cập nhật nhân viên" : "Tạo nhân viên"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;
