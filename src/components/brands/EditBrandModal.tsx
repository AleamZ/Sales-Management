import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateBrand } from '../../services/brand.service';
import { Brand } from '../../interface/brand.interface';

interface EditBrandModalProps {
    visible: boolean;
    brand: {
        id: string;
        title: string;
    } | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const EditBrandModal: React.FC<EditBrandModalProps> = ({
    visible,
    brand,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Reset form fields when modal opens or brand changes
    useEffect(() => {
        if (visible && brand) {
            form.setFieldsValue({
                name: brand.title
            });
        }
    }, [visible, brand, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (!brand?.id) {
                message.error('Không tìm thấy thông tin thương hiệu');
                return;
            }

            // Call API to update brand
            const brandData: Partial<Brand> = {
                name: values.name
            };

            await updateBrand(brand.id, brandData);
            message.success('Cập nhật thương hiệu thành công');
            setLoading(false);
            onSuccess();
        } catch (error) {
            console.error("Error updating brand:", error);
            message.error('Cập nhật thương hiệu thất bại');
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa thương hiệu"
            open={visible}  // Changed from visible to open
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            maskClosable={false}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false}
            >
                <Form.Item
                    name="name"
                    label="Tên thương hiệu"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên thương hiệu' },
                        { max: 100, message: 'Tên thương hiệu không được vượt quá 100 ký tự' }
                    ]}
                >
                    <Input placeholder="Nhập tên thương hiệu" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditBrandModal;
