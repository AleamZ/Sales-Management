import React, { useState } from 'react';
import { Button, Form, Input, message, Steps } from 'antd';
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOTP, resetPassword } from '../services/auth.service';

const ForgotPasswordPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const steps = [
        {
            title: 'Nhập Email',
            content: (
                <Form
                    form={form}
                    onFinish={async (values) => {
                        try {
                            await forgotPassword(values.email);
                            message.success('Mã OTP đã được gửi đến email của bạn');
                            setEmail(values.email);
                            setCurrentStep(1);
                        } catch (error: any) {
                            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP');
                        }
                    }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập email của bạn"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Gửi mã OTP
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            title: 'Xác thực OTP',
            content: (
                <Form
                    form={form}
                    onFinish={async (values) => {
                        try {
                            await verifyOTP(email, values.otp);
                            setOtp(values.otp);
                            message.success('Mã OTP hợp lệ');
                            setCurrentStep(2);
                        } catch (error: any) {
                            message.error(error.response?.data?.message || 'Mã OTP không hợp lệ');
                        }
                    }}
                >
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã OTP' },
                            { len: 6, message: 'Mã OTP phải có 6 ký tự' }
                        ]}
                    >
                        <Input
                            prefix={<KeyOutlined />}
                            placeholder="Nhập mã OTP"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Xác nhận OTP
                        </Button>
                        <Button
                            type="link"
                            block
                            onClick={async () => {
                                try {
                                    await forgotPassword(email);
                                    message.success('Đã gửi lại mã OTP mới');
                                } catch (error: any) {
                                    message.error(error.response?.data?.message || 'Không thể gửi lại mã OTP');
                                }
                            }}
                        >
                            Gửi lại mã OTP
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            title: 'Đặt lại mật khẩu',
            content: (
                <Form
                    form={form}
                    onFinish={async (values) => {
                        try {
                            await resetPassword(email, otp, values.newPassword);
                            message.success('Đặt lại mật khẩu thành công');
                            navigate('/login');
                        } catch (error: any) {
                            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
                        }
                    }}
                >
                    <Form.Item
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Xác nhận mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Đặt lại mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            )
        }
    ];

    return (
        <div style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            backgroundColor: 'white'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Quên mật khẩu</h2>
            <Steps
                current={currentStep}
                items={steps.map(item => ({ title: item.title }))}
                style={{ marginBottom: '30px' }}
            />
            <div>{steps[currentStep].content}</div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Button type="link" onClick={() => navigate('/login')}>
                    Quay lại đăng nhập
                </Button>
            </div>
        </div>
    );
};

export default ForgotPasswordPage; 