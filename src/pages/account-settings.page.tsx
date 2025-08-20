import React, { useState, useEffect } from 'react';
import {
    Card,
    Tabs,
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Typography,
    Divider,
    Space,
    Avatar,
    Tag,
} from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { AccountService, UpdateProfileData, ChangePasswordData, UserProfile } from '@/services/account.service';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AccountSettingsPage: React.FC = () => {
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Load user profile on component mount
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const profile = await AccountService.getProfile();
            setUserProfile(profile);
            profileForm.setFieldsValue({
                name: profile.name,
                email: profile.email,
            });
        } catch (error) {
            message.error('Không thể tải thông tin tài khoản');
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (values: UpdateProfileData) => {
        try {
            setProfileLoading(true);
            const updatedProfile = await AccountService.updateProfile(values);
            setUserProfile(updatedProfile);
            message.success('Cập nhật thông tin thành công');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Cập nhật thông tin thất bại';
            message.error(errorMessage);
            console.error('Error updating profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (values: ChangePasswordData) => {
        try {
            setPasswordLoading(true);
            await AccountService.changePassword(values);
            passwordForm.resetFields();
            message.success('Đổi mật khẩu thành công');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Đổi mật khẩu thất bại';
            message.error(errorMessage);
            console.error('Error changing password:', error);
        } finally {
            setPasswordLoading(false);
        }
    };

    const validateConfirmPassword = (_: any, value: string) => {
        const newPassword = passwordForm.getFieldValue('newPassword');
        if (value && newPassword !== value) {
            return Promise.reject(new Error('Xác nhận mật khẩu không khớp'));
        }
        return Promise.resolve();
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return { text: 'Quản trị viên', color: 'red' };
            case 'STAFF':
                return { text: 'Nhân viên', color: 'blue' };
            default:
                return { text: role, color: 'default' };
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Space size="middle">
                    <div>Đang tải...</div>
                </Space>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Avatar size={80} icon={<UserOutlined />} />
                                <Title level={3} style={{ marginTop: '16px', marginBottom: '8px' }}>
                                    {userProfile?.name}
                                </Title>
                                <Text type="secondary">{userProfile?.email}</Text>
                                <div style={{ marginTop: '8px' }}>
                                    {userProfile?.role && (
                                        <Tag color={getRoleDisplayName(userProfile.role).color}>
                                            {getRoleDisplayName(userProfile.role).text}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card>
                        <Tabs defaultActiveKey="profile" size="large">
                            <TabPane
                                tab={
                                    <span>
                                        <UserOutlined />
                                        Thông tin cá nhân
                                    </span>
                                }
                                key="profile"
                            >
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                    size="large"
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="name"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập họ và tên' },
                                                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
                                                ]}
                                            >
                                                <Input placeholder="Nhập họ và tên" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email' },
                                                    { type: 'email', message: 'Email không hợp lệ' },
                                                ]}
                                            >
                                                <Input placeholder="Nhập email" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={profileLoading}
                                            icon={<SaveOutlined />}
                                            size="large"
                                        >
                                            Cập nhật thông tin
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        <LockOutlined />
                                        Đổi mật khẩu
                                    </span>
                                }
                                key="password"
                            >
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handleChangePassword}
                                    size="large"
                                >
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item
                                                label="Mật khẩu hiện tại"
                                                name="currentPassword"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
                                                ]}
                                            >
                                                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Mật khẩu mới"
                                                name="newPassword"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                                ]}
                                            >
                                                <Input.Password placeholder="Nhập mật khẩu mới" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Xác nhận mật khẩu mới"
                                                name="confirmPassword"
                                                rules={[
                                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                                    { validator: validateConfirmPassword },
                                                ]}
                                            >
                                                <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={passwordLoading}
                                            icon={<LockOutlined />}
                                            size="large"
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AccountSettingsPage; 