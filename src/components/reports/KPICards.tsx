import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingCartOutlined, TrophyOutlined, UserOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatCurrency.util';

interface KPIData {
    title: string;
    value: number;
    prefix?: React.ReactNode;
    suffix?: string;
    trend?: number;
    isMonetary?: boolean;
    color?: string;
}

interface KPICardsProps {
    data: KPIData[];
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
    const getTrendIcon = (trend?: number) => {
        if (!trend) return null;
        return trend > 0 ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
        ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
        );
    };

    const getTrendColor = (trend?: number) => {
        if (!trend) return '#666';
        return trend > 0 ? '#52c41a' : '#ff4d4f';
    };

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {data.map((item, index) => (
                <Col xs={24} sm={12} lg={4} key={index}>
                    <Card
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: '1px solid #f0f0f0'
                        }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <Statistic
                            title={
                                <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                                    {item.title}
                                </span>
                            }
                            value={item.isMonetary ? item.value : item.value}
                            precision={item.isMonetary ? 0 : 0}
                            valueStyle={{
                                color: item.color || '#1677ff',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}
                            prefix={item.prefix}
                            suffix={item.suffix}
                            formatter={(value) => {
                                if (item.isMonetary) {
                                    return formatCurrency(Number(value)).replace(' ₫', '');
                                }
                                return value;
                            }}
                        />
                        {item.trend !== undefined && (
                            <div style={{ marginTop: '8px', fontSize: '11px' }}>
                                <span style={{ color: getTrendColor(item.trend) }}>
                                    {getTrendIcon(item.trend)}
                                    <span style={{ marginLeft: '4px' }}>
                                        {Math.abs(item.trend).toFixed(1)}% so với kỳ trước
                                    </span>
                                </span>
                            </div>
                        )}
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

// Predefined KPI data generators
export const generateKPIData = (dashboardData: any, salesData?: any): KPIData[] => [
    {
        title: 'Tổng Doanh Thu',
        value: dashboardData?.totalRevenue || 0,
        prefix: <DollarOutlined />,
        isMonetary: true,
        color: '#1677ff',
        trend: dashboardData?.revenueGrowth
    },
    {
        title: 'Tổng Lợi Nhuận',
        value: dashboardData?.totalProfit || 0,
        prefix: <TrophyOutlined />,
        isMonetary: true,
        color: '#52c41a',
        trend: dashboardData?.profitGrowth
    },
    {
        title: 'Tổng Công Nợ',
        value: salesData?.summary?.totalDebt || 0,
        prefix: <CreditCardOutlined />,
        isMonetary: true,
        color: '#ff7a00',
        trend: Math.floor(Math.random() * 30) - 15 // Mock trend data for debt
    },
    {
        title: 'DT Thực Tế',
        value: salesData?.summary?.actualRevenue || 0,
        prefix: <CheckCircleOutlined />,
        isMonetary: true,
        color: '#52c41a',
        trend: Math.floor(Math.random() * 20) - 5 // Mock trend data for actual revenue
    },
    {
        title: 'Số Đơn Hàng',
        value: dashboardData?.totalOrders || 0,
        prefix: <ShoppingCartOutlined />,
        color: '#fa8c16',
        suffix: 'đơn',
        trend: dashboardData?.ordersGrowth
    },
    {
        title: 'Khách Hàng Mới',
        value: dashboardData?.newCustomers || 0,
        prefix: <UserOutlined />,
        color: '#722ed1',
        suffix: 'khách',
        trend: dashboardData?.customersGrowth
    }
];

export default KPICards; 