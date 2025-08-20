import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import categoryService from '../../services/category.service';

interface EditCategoryModalProps {
    visible: boolean;
    category: { id: string; title: string } | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
    visible,
    category,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    // Update form when category changes
    useEffect(() => {
        if (visible && category) {
            form.setFieldsValue({
                name: category.title,
            });
        }
    }, [form, category, visible]);

    const handleOk = async () => {
        if (!category) return;

        try {
            const values = await form.validateFields();
            setLoading(true);

            // Call API to update category
            await categoryService.updateCategory(category.id, {
                name: values.name,
            });

            setLoading(false);
            onSuccess();
            message.success('Cập nhật danh mục thành công');
        } catch (error) {
            setLoading(false);
            console.error('Error updating category:', error);
            message.error('Không thể cập nhật danh mục. Vui lòng thử lại.');
        }
    };

    return (
        <Modal
            title="Chỉnh Sửa Danh Mục"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
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

export default EditCategoryModal;
