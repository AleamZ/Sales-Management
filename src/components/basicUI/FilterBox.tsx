import React, { ReactNode, useState } from 'react';
import { Typography, Divider } from 'antd';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import '../../styles/basicUI/filterBox.scss';

const { Title } = Typography;

interface FilterBoxProps {
    title: string;
    children: ReactNode;
    className?: string;
    isCollapsible?: boolean;
    defaultCollapsed?: boolean;
}

const FilterBox: React.FC<FilterBoxProps> = ({
    title,
    children,
    className = '',
    isCollapsible = true,
    defaultCollapsed = false,
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const toggleCollapsed = () => {
        if (isCollapsible) {
            setCollapsed(!collapsed);
        }
    };

    return (
        <div className={`filter-box ${className} ${collapsed ? 'filter-box-collapsed' : ''}`}>
            <div className="filter-box-header" onClick={toggleCollapsed}>
                {isCollapsible && (
                    <span className="filter-box-collapse-icon">
                        {collapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                    </span>
                )}
                <Title level={5} className="filter-box-title">{title}</Title>
            </div>

            {!collapsed && (
                <>
                    <Divider className="filter-box-divider" />
                    <div className="filter-box-content">
                        {children}
                    </div>
                </>
            )}
        </div>
    );
};

export default FilterBox;
