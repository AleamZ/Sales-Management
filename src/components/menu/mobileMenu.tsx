import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    EllipsisOutlined,
    AppstoreOutlined,
    TeamOutlined,
    SettingOutlined,
    BarChartOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { Drawer, Menu } from 'antd';

const MobileMenu: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [moreDrawerVisible, setMoreDrawerVisible] = useState(false);

    // Determine active item based on current path
    const getActiveItem = (path: string) => {
        if (path === '/' || path.startsWith('/dashboard')) return 'overview';
        if (path.startsWith('/products')) return 'products';
        if (path.startsWith('/sales')) return 'sales';
        if (path.startsWith('/invoices')) return 'invoices';
        return '';
    };

    const activeItem = getActiveItem(location.pathname);

    // Handle navigation
    const navigateTo = (path: string) => {
        navigate(path);
    };

    // Handle showing more options
    const showMoreOptions = () => {
        setMoreDrawerVisible(true);
    };

    return (
        <>
            <div className="mobile-menu">
                <div
                    className={`mobile-menu__item ${activeItem === 'overview' ? 'active' : ''}`}
                    onClick={() => navigateTo('/')}
                >
                    <HomeOutlined />
                    <span>Tổng Quan</span>
                </div>

                <div
                    className={`mobile-menu__item ${activeItem === 'products' ? 'active' : ''}`}
                    onClick={() => navigateTo('/products')}
                >
                    <ShoppingOutlined />
                    <span>Hàng Hóa</span>
                </div>

                <div
                    className={`mobile-menu__item ${activeItem === 'sales' ? 'active' : ''}`}
                    onClick={() => navigateTo('/sales')}
                >
                    <ShoppingCartOutlined />
                    <span>Bán Hàng</span>
                </div>

                <div
                    className={`mobile-menu__item ${activeItem === 'invoices' ? 'active' : ''}`}
                    onClick={() => navigateTo('/invoices')}
                >
                    <FileTextOutlined />
                    <span>Hóa Đơn</span>
                </div>

                <div
                    className="mobile-menu__item"
                    onClick={showMoreOptions}
                >
                    <EllipsisOutlined />
                    <span>Nhiều Hơn</span>
                </div>
            </div>

            {/* More options drawer */}
            <Drawer
                title="Nhiều Hơn"
                placement="bottom"
                closable={true}
                onClose={() => setMoreDrawerVisible(false)}
                visible={moreDrawerVisible}
                height={350}
                className="more-options-drawer"
            >
                <Menu>
                    <Menu.Item key="categories" icon={<AppstoreOutlined />} onClick={() => navigateTo('/products/categories')}>
                        Danh Mục
                    </Menu.Item>
                    <Menu.Item key="partners" icon={<TeamOutlined />} onClick={() => navigateTo('/partners')}>
                        Đối Tác
                    </Menu.Item>
                    <Menu.Item key="reports" icon={<BarChartOutlined />} onClick={() => navigateTo('/reports')}>
                        Báo Cáo
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigateTo('/settings')}>
                        Cài Đặt
                    </Menu.Item>
                    <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={() => navigateTo('/logout')}>
                        Đăng Xuất
                    </Menu.Item>
                </Menu>
            </Drawer>
        </>
    );
};

export default MobileMenu;
