import React, { useState } from 'react';
import { Row, Col, Card, Typography, Tabs, Space, Spin } from 'antd';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Styles
import '../styles/pages/reports.page.scss';

// Components
import KPICards, { generateKPIData } from '../components/reports/KPICards';
import TimeFilter, { TimeFilterType } from '../components/reports/TimeFilter';
import CustomLineChart from '../components/charts/LineChart';
import CustomPieChart from '../components/charts/PieChart';
import RevenueBarChart from '../components/dashboard/RevenueBarChart.dashboard';
import TopTenRevenueBarChart from '../components/dashboard/TopTenRevenueBarChart.dashboard';

// Hooks
import { useRevenueByTimeType, useTopProductsByQuantityAndRevenue, useReveunes, useCustomerAnalytics, useCategoryDistribution, useSalesReport } from '../hooks/useDashboard';
import { TimeType } from '../services/dashboard.service';
import { formatCurrency } from '../utils/formatCurrency.util';

const { Title } = Typography;
const { TabPane } = Tabs;

const ReportsPage: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<TimeFilterType>('THIS_MONTH');
    const [customDateRange, setCustomDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>();

    // Convert timeFilter to API format
    const getApiTimeType = (filter: TimeFilterType): TimeType => {
        switch (filter) {
            case 'TODAY': return 'TODAY';
            case 'YESTERDAY': return 'YESTERDAY';
            case 'THIS_WEEK': return 'THIS_WEEK';
            case 'THIS_MONTH': return 'THIS_MONTH';
            case 'LAST_MONTH': return 'LAST_MONTH';
            case 'THIS_QUARTER': return 'THIS_QUARTER';
            case 'THIS_YEAR': return 'THIS_YEAR';
            case 'CUSTOM': return 'CUSTOM';
            default: return 'THIS_MONTH';
        }
    };

    const apiTimeType = getApiTimeType(timeFilter);

    // Convert custom date range to ISO strings
    const customFromISO = customDateRange?.[0]?.toISOString();
    const customToISO = customDateRange?.[1]?.toISOString();

    // API calls
    const { data: revenueData, isLoading: revenueLoading } = useRevenueByTimeType(apiTimeType, customFromISO, customToISO);
    const { data: topProducts, isLoading: topProductsLoading } = useTopProductsByQuantityAndRevenue(apiTimeType, customFromISO, customToISO);
    const { data: overviewData, isLoading: overviewLoading } = useReveunes();
    const { data: customerData, isLoading: customerLoading } = useCustomerAnalytics(apiTimeType, customFromISO, customToISO);
    const { data: categoryDistribution, isLoading: categoryLoading } = useCategoryDistribution(apiTimeType, customFromISO, customToISO);
    const { data: salesData, isLoading: salesLoading } = useSalesReport({
        timeType: apiTimeType,
        customFrom: customDateRange?.[0]?.toDate(),
        customTo: customDateRange?.[1]?.toDate(),
    });

    const handleTimeFilterChange = (value: TimeFilterType, dateRange?: [dayjs.Dayjs, dayjs.Dayjs]) => {
        setTimeFilter(value);
        if (dateRange) {
            setCustomDateRange(dateRange);
        }
    };

    // Transform data for charts
    const transformRevenueChartData = (data: any[]) => {
        return data?.map((item) => ({
            date: item.date,
            revenue: item.revenue,
            profit: item.profit,
            orders: Math.floor(Math.random() * 50) + 10 // Mock data - replace with real API
        })) ?? [];
    };

    const transformTopProductsData = (data: any[]) => {
        const total = data?.reduce((sum, item) => sum + item.value, 0) || 1;
        return data?.map((item) => ({
            name: item.date,
            value: item.value,
            percentage: (item.value / total) * 100
        })) ?? [];
    };

    // Use real category data from API or fallback to mock data for debugging
    const categoryData = categoryDistribution?.categories?.length > 0
        ? categoryDistribution.categories
        : [
            { name: 'Điện thoại', value: 45000000, percentage: 45 },
            { name: 'Laptop', value: 30000000, percentage: 30 },
            { name: 'Phụ kiện', value: 15000000, percentage: 15 },
            { name: 'Tablet', value: 10000000, percentage: 10 }
        ];

    // Debug log
    console.log('=== CATEGORY DEBUG ===');
    console.log('1. API Response:', categoryDistribution);
    console.log('2. Categories Array:', categoryDistribution?.categories);
    console.log('3. Has Real Data:', categoryDistribution?.categories?.length > 0);
    console.log('4. Final Category Data:', categoryData);
    console.log('5. Loading State:', categoryLoading);
    console.log('6. API Time Type:', apiTimeType);
    console.log('7. Custom Dates:', { customFromISO, customToISO });
    console.log('======================');



    // Generate KPI data
    const kpiData = generateKPIData({
        totalRevenue: revenueData?.totalRevenue || 0,
        totalProfit: revenueData?.totalProfit || 0,
        totalOrders: revenueData?.totalOrders || 0, // Fixed: use revenueData instead of overviewData
        newCustomers: customerData?.newCustomers || 0, // Real data from API
        revenueGrowth: overviewData?.compareWithYesterday || 0,
        profitGrowth: Math.floor(Math.random() * 20) - 10, // Mock data
        ordersGrowth: Math.floor(Math.random() * 15) - 5, // Mock data
        customersGrowth: customerData?.newCustomersGrowth || 0 // Real data from API
    }, salesData);

    const isLoading = revenueLoading || topProductsLoading || overviewLoading || customerLoading || categoryLoading || salesLoading;

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: '#1677ff' }}>
                        <BarChartOutlined style={{ marginRight: '12px' }} />
                        Báo Cáo Tổng Hợp
                    </Title>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        Phân tích doanh thu, lợi nhuận và hiệu suất kinh doanh
                    </p>
                </Col>
            </Row>

            {/* Time Filter */}
            <TimeFilter
                value={timeFilter}
                onChange={handleTimeFilterChange}
                customDateRange={customDateRange}
            />

            {/* Debug Panel */}
            {/* <Card style={{ marginBottom: '16px', background: '#fff7e6', border: '1px solid #ffd591' }}>
                <Space>
                    <span>🔧 Debug Panel:</span>
                    <button onClick={testCategoryAPI} style={{ padding: '4px 8px', background: '#1677ff', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Test Category API
                    </button>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                        Check console for results
                    </span>
                </Space>
            </Card> */}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px' }}>Đang tải dữ liệu báo cáo...</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <KPICards data={kpiData} />

                    {/* Main Charts */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        {/* Revenue Trend Chart */}
                        <Col xs={24} lg={16}>
                            <Card
                                style={{
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                title={
                                    <Space>
                                        <LineChartOutlined style={{ color: '#1677ff' }} />
                                        <span>Xu Hướng Doanh Thu & Lợi Nhuận</span>
                                    </Space>
                                }
                            >
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="Theo Ngày" key="1">
                                        <RevenueBarChart
                                            data={transformRevenueChartData(revenueData?.chartDay)}
                                            showProfit={true}
                                            height={350}
                                        />
                                    </TabPane>
                                    <TabPane tab="Theo Giờ" key="2">
                                        <RevenueBarChart
                                            data={transformRevenueChartData(revenueData?.chartHour)}
                                            showProfit={true}
                                            height={350}
                                        />
                                    </TabPane>
                                    <TabPane tab="Theo Thứ" key="3">
                                        <RevenueBarChart
                                            data={transformRevenueChartData(revenueData?.chartWeek)}
                                            showProfit={true}
                                            height={350}
                                        />
                                    </TabPane>
                                </Tabs>
                            </Card>
                        </Col>

                        {/* Category Distribution */}
                        <Col xs={24} lg={8}>
                            {categoryLoading ? (
                                <div style={{
                                    background: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    padding: '20px',
                                    height: '350px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <CustomPieChart
                                    data={categoryData}
                                    title={`Phân Bổ Doanh Thu Theo Danh Mục ${categoryDistribution?.categories?.length > 0 ? '' : '(Demo)'}`}
                                    height={350}
                                    isRevenue={true}
                                />
                            )}
                        </Col>
                    </Row>

                    {/* Secondary Charts */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        {/* Top Products by Revenue */}
                        <Col xs={24} lg={12}>
                            <Card
                                style={{
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                title={
                                    <Space>
                                        <BarChartOutlined style={{ color: '#52c41a' }} />
                                        <span>Top 10 Sản Phẩm Theo Doanh Thu</span>
                                    </Space>
                                }
                            >
                                <TopTenRevenueBarChart
                                    data={topProducts?.revenue || []}
                                    height={300}
                                    isQuantityChart={false}
                                />
                            </Card>
                        </Col>

                        {/* Top Products by Quantity */}
                        <Col xs={24} lg={12}>
                            <Card
                                style={{
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                title={
                                    <Space>
                                        <BarChartOutlined style={{ color: '#fa8c16' }} />
                                        <span>Top 10 Sản Phẩm Theo Số Lượng</span>
                                    </Space>
                                }
                            >
                                <TopTenRevenueBarChart
                                    data={topProducts?.quantity || []}
                                    height={300}
                                    isQuantityChart={true}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Additional Charts */}
                    <Row gutter={[16, 16]}>
                        {/* Debt & Actual Revenue Chart */}
                        {salesData && (
                            <Col xs={24} lg={12}>
                                <Card
                                    style={{
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    title={
                                        <Space>
                                            <span style={{ color: '#ff7a00' }}>📊</span>
                                            <span>Tổng Quan Công Nợ & Doanh Thu Thực Tế</span>
                                        </Space>
                                    }
                                >
                                    <CustomPieChart
                                        data={[
                                            {
                                                name: 'Doanh Thu Thực Tế',
                                                value: salesData.summary?.actualRevenue || 0,
                                                percentage: salesData.summary?.totalSellPrice ?
                                                    ((salesData.summary.actualRevenue / salesData.summary.totalSellPrice) * 100) : 100
                                            },
                                            {
                                                name: 'Công Nợ Chưa Thu',
                                                value: salesData.summary?.totalDebt || 0,
                                                percentage: salesData.summary?.totalSellPrice ?
                                                    ((salesData.summary.totalDebt / salesData.summary.totalSellPrice) * 100) : 0
                                            }
                                        ]}
                                        title=""
                                        height={300}
                                        isRevenue={true}
                                    />
                                    {salesData.summary?.totalDebt > 0 && (
                                        <div style={{ marginTop: '16px', padding: '12px', background: '#fffbe6', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                                            <div style={{ fontSize: '13px', color: '#d48806', marginBottom: '4px', fontWeight: 500 }}>
                                                ⚠️ Có {formatCurrency(salesData.summary.totalDebt)} công nợ chưa thu
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666' }}>
                                                Tỷ lệ thu thực tế: {((salesData.summary.actualRevenue / salesData.summary.totalSellPrice) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        )}

                        {/* Top Products Distribution */}
                        <Col xs={24} lg={salesData ? 12 : 12}>
                            <CustomPieChart
                                data={transformTopProductsData(topProducts?.quantity?.slice(0, 8) || [])}
                                title="Phân Bổ Sản Phẩm Bán Chạy"
                                height={300}
                                isRevenue={false}
                            />
                        </Col>

                        {/* Revenue Line Chart */}
                        {!salesData && (
                            <Col xs={24} lg={12}>
                                <CustomLineChart
                                    data={transformRevenueChartData(revenueData?.chartDay)}
                                    title="Biểu Đồ Đường Doanh Thu"
                                    height={300}
                                    showRevenue={true}
                                    showProfit={true}
                                />
                            </Col>
                        )}
                    </Row>

                    {/* Revenue Line Chart - Full Width when debt chart exists */}
                    {salesData && (
                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col xs={24}>
                                <CustomLineChart
                                    data={transformRevenueChartData(revenueData?.chartDay)}
                                    title="Biểu Đồ Đường Doanh Thu & Lợi Nhuận"
                                    height={300}
                                    showRevenue={true}
                                    showProfit={true}
                                />
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </div>
    );
};

export default ReportsPage;