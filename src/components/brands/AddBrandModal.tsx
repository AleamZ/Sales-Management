import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createBrand } from '../../services/brand.service';
import { Brand } from '../../interface/brand.interface';

interface AddBrandModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Call API to create brand
            const brandData: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'> = {
                name: values.name,
            };

            await createBrand(brandData);
            message.success('Thêm thương hiệu thành công');
            form.resetFields();
            setLoading(false);
            onSuccess();
        } catch (error) {
            console.error("Error creating brand:", error);
            message.error('Thêm thương hiệu thất bại');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Thêm thương hiệu mới"
            open={visible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            maskClosable={false}
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

export default AddBrandModal;
