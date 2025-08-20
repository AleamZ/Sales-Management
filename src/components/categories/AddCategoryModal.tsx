import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import categoryService from '../../services/category.service';

interface AddCategoryModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Call API to create new category
            await categoryService.createCategory({
                name: values.name,
            });

            setLoading(false);
            form.resetFields();
            onSuccess();
            message.success('Thêm danh mục thành công');
        } catch (error) {
            setLoading(false);
            console.error('Error creating category:', error);
            message.error('Không thể thêm danh mục. Vui lòng thử lại.');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Thêm Danh Mục Mới"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            maskClosable={false}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>
                {/* <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục (không bắt buộc)" />
                </Form.Item> */}
            </Form>
        </Modal>
    );
};

export default AddCategoryModal;
