import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { registerService, RegisterRequest } from '@/services/auth.service';

const { Title } = Typography;

const RegisterLayout = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: RegisterRequest) => {
        setLoading(true);
        try {
            const response = await registerService(values);

            // Check if registration was successful
            if (response.ok) {
                message.success(response.message || 'Registration successful!');
                // Redirect to login page after successful registration
                navigate('/login');
            } else {
                message.error(response.message || 'Registration failed. Please try again.');
            }
        } catch (error: unknown) {
            // Handle API error response with detailed feedback
            console.error('Registration failed:', error);

            // Format error message based on common API error structures
            let errorMessage = 'Registration failed. Please try again.';

            if (typeof error === 'object' && error !== null) {
                interface ApiError {
                    message?: string | string[];
                    error?: string;
                }

                const err = error as ApiError;

                if (Array.isArray(err.message)) {
                    errorMessage = err.message.join(', ');
                } else if (typeof err.message === 'string') {
                    errorMessage = err.message;
                } else if (err.error && typeof err.error === 'string') {
                    errorMessage = err.error;
                }
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>Register</Title>
                    <Form
                        name="register_form"
                        form={form}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Full Name"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email address!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm Password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%' }}
                                size="large"
                                loading={loading}
                            >
                                Register
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            Already have an account? <Link to="/login">Login now!</Link>
                        </div>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default RegisterLayout;