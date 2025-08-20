import React, { useState } from 'react';
import { Card, DatePicker, Button, Row, Col, Table, Typography, Space, Divider, Tag, message } from 'antd';
import { FileTextOutlined, ShoppingCartOutlined, DownloadOutlined } from '@ant-design/icons';
import { useSalesReport } from '@/hooks/useDashboard';
import { formatCurrency } from '@/utils/formatCurrency.util';
import { DashboardService } from '@/services/dashboard.service';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface SalesDetailData {
    orderId: string;
    orderDate: string;
    customerName: string;
    customerPhone: string;
    productName: string;
    barcode: string;
    serial: string;
    quantity: number;
    sellPrice: number;
    realSellPrice: number;
    totalSellAmount: number;
    costPrice: number;
    totalCostAmount: number;
    profit: number;
    debt: number;
    actualRevenue: number;
    actualProfit: number; // THÊM: Lợi nhuận thực tế
    isReturnOrder: boolean;
}

const TableReportsPage: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('today');
    const [customRange, setCustomRange] = useState<[any, any] | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Convert to API format
    const getApiTimeType = (filter: string) => {
        const mapping: { [key: string]: any } = {
            'today': 'TODAY',
            'yesterday': 'YESTERDAY',
            'week': 'THIS_WEEK',
            'month': 'THIS_MONTH',
            'quarter': 'THIS_QUARTER',
            'year': 'THIS_YEAR',
            'custom': 'CUSTOM'
        };
        return mapping[filter] || 'TODAY';
    };

    const { data: reportData, isLoading } = useSalesReport({
        timeType: getApiTimeType(timeFilter),
        customFrom: customRange?.[0]?.toDate(),
        customTo: customRange?.[1]?.toDate(),
    });

    // Sample data for testing when no real data
    const sampleData = React.useMemo(() => {
        if (reportData && reportData.salesDetails && reportData.salesDetails.length > 0) {
            return reportData;
        }

        // Return sample data for testing UI
        return {
            period: {
                from: new Date().toISOString(),
                to: new Date().toISOString(),
                timeType: 'TODAY'
            },
            summary: {
                totalOrders: 2,
                totalProducts: 3,
                totalQuantity: 5,
                totalSellPrice: 1500000,
                totalCostPrice: 1000000,
                totalProfit: 500000,
                totalDebt: 300000,
                actualRevenue: 1200000,
                actualProfit: 200000, // THÊM: Lợi nhuận thực tế = 500k - 300k
            },
            salesDetails: [
                {
                    orderId: 'ORDER001',
                    orderDate: new Date().toISOString(),
                    customerName: 'Nguyễn Văn A',
                    customerPhone: '0123456789',
                    productName: 'iPhone 14 Pro Max',
                    barcode: 'IP14PM001',
                    serial: 'IP14PM001001',
                    quantity: 1,
                    sellPrice: 30000000,
                    realSellPrice: 29000000,
                    totalSellAmount: 30000000,
                    costPrice: 25000000,
                    totalCostAmount: 25000000,
                    profit: 5000000,
                    debt: 200000, // THÊM: Công nợ
                    actualRevenue: 29800000, // THÊM: Doanh thu thực tế
                    actualProfit: 4800000, // THÊM: Lợi nhuận thực tế = 5000k - 200k
                    isReturnOrder: false
                },
                {
                    orderId: 'ORDER001',
                    orderDate: new Date().toISOString(),
                    customerName: 'Nguyễn Văn A',
                    customerPhone: '0123456789',
                    productName: 'Ốp lưng iPhone 14 Pro Max',
                    barcode: 'CASE001',
                    serial: null,
                    quantity: 2,
                    sellPrice: 500000,
                    realSellPrice: 450000,
                    totalSellAmount: 1000000,
                    costPrice: 300000,
                    totalCostAmount: 600000,
                    profit: 400000,
                    debt: 50000, // THÊM: Công nợ
                    actualRevenue: 950000, // THÊM: Doanh thu thực tế
                    actualProfit: 350000, // THÊM: Lợi nhuận thực tế = 400k - 50k
                    isReturnOrder: false
                },
                {
                    orderId: 'ORDER002',
                    orderDate: new Date().toISOString(),
                    customerName: 'Trần Thị B',
                    customerPhone: '0987654321',
                    productName: 'Samsung Galaxy S23',
                    barcode: 'SGS23001',
                    serial: 'SGS23001001',
                    quantity: 1,
                    sellPrice: 20000000,
                    realSellPrice: 19500000,
                    totalSellAmount: 20000000,
                    costPrice: 16000000,
                    totalCostAmount: 16000000,
                    profit: 4000000,
                    debt: 50000, // THÊM: Công nợ
                    actualRevenue: 19450000, // THÊM: Doanh thu thực tế
                    actualProfit: 3950000, // THÊM: Lợi nhuận thực tế = 4000k - 50k
                    isReturnOrder: false
                }
            ]
        };
    }, [reportData]);

    const displayData = reportData || sampleData;

    const timeButtons = [
        { key: 'today', label: 'Hôm nay' },
        { key: 'yesterday', label: 'Hôm qua' },
        { key: 'week', label: 'Tuần này' },
        { key: 'month', label: 'Tháng này' },
        { key: 'quarter', label: 'Quý này' },
        { key: 'year', label: 'Năm này' },
        { key: 'custom', label: 'Tùy chọn' },
    ];

    // Group sales details by order ID for display
    const groupedData = React.useMemo(() => {
        if (!displayData?.salesDetails) return [];

        const grouped: any[] = [];
        let currentOrderId = '';
        let orderItems: any[] = [];

        displayData.salesDetails.forEach((item: SalesDetailData, index: number) => {
            if (item.orderId !== currentOrderId) {
                // If we have previous order items, add them to grouped data
                if (orderItems.length > 0) {
                    // Add order header
                    grouped.push({
                        key: `order-${currentOrderId}`,
                        isOrderHeader: true,
                        orderId: currentOrderId,
                        orderDate: orderItems[0].orderDate,
                        customerName: orderItems[0].customerName,
                        customerPhone: orderItems[0].customerPhone,
                        isReturnOrder: orderItems[0].isReturnOrder,
                        totalOrderAmount: orderItems.reduce((sum, item) => sum + item.totalSellAmount, 0),
                        totalOrderProfit: orderItems.reduce((sum, item) => sum + item.profit, 0),
                        totalOrderDebt: orderItems.reduce((sum, item) => sum + item.debt, 0), // THÊM: Tổng công nợ đơn hàng
                        totalOrderActualRevenue: orderItems.reduce((sum, item) => sum + item.actualRevenue, 0), // THÊM: Tổng doanh thu thực tế đơn hàng
                        totalOrderActualProfit: orderItems.reduce((sum, item) => sum + item.actualProfit, 0), // THÊM: Tổng lợi nhuận thực tế đơn hàng
                        itemCount: orderItems.length
                    });

                    // Add order items
                    orderItems.forEach((orderItem, itemIndex) => {
                        grouped.push({
                            key: `item-${currentOrderId}-${itemIndex}`,
                            isOrderItem: true,
                            ...orderItem
                        });
                    });
                }

                // Start new order group
                currentOrderId = item.orderId;
                orderItems = [item];
            } else {
                orderItems.push(item);
            }

            // Handle last group
            if (index === displayData.salesDetails.length - 1) {
                grouped.push({
                    key: `order-${currentOrderId}`,
                    isOrderHeader: true,
                    orderId: currentOrderId,
                    orderDate: orderItems[0].orderDate,
                    customerName: orderItems[0].customerName,
                    customerPhone: orderItems[0].customerPhone,
                    isReturnOrder: orderItems[0].isReturnOrder,
                    totalOrderAmount: orderItems.reduce((sum, item) => sum + item.totalSellAmount, 0),
                    totalOrderProfit: orderItems.reduce((sum, item) => sum + item.profit, 0),
                    totalOrderDebt: orderItems.reduce((sum, item) => sum + item.debt, 0), // THÊM: Tổng công nợ đơn hàng
                    totalOrderActualRevenue: orderItems.reduce((sum, item) => sum + item.actualRevenue, 0), // THÊM: Tổng doanh thu thực tế đơn hàng
                    totalOrderActualProfit: orderItems.reduce((sum, item) => sum + item.actualProfit, 0), // THÊM: Tổng lợi nhuận thực tế đơn hàng
                    itemCount: orderItems.length
                });

                orderItems.forEach((orderItem, itemIndex) => {
                    grouped.push({
                        key: `item-${currentOrderId}-${itemIndex}`,
                        isOrderItem: true,
                        ...orderItem
                    });
                });
            }
        });

        return grouped;
    }, [displayData?.salesDetails]);

    const columns = [
        {
            title: 'Thông Tin',
            dataIndex: 'info',
            key: 'info',
            width: 250,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return (
                        <div style={{ backgroundColor: '#f0f9ff', padding: '8px', borderRadius: '4px', border: '1px solid #e1f5fe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <ShoppingCartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                <Text strong>HD: {record.orderId.slice(-8)}</Text>
                                {record.isReturnOrder && (
                                    <Tag color="orange" style={{ marginLeft: '8px' }}>Hoàn trả</Tag>
                                )}
                            </div>
                            <div><Text type="secondary">Ngày: {new Date(record.orderDate).toLocaleDateString('vi-VN')}</Text></div>
                            <div><Text type="secondary">KH: {record.customerName}</Text></div>
                            {record.customerPhone && (
                                <div><Text type="secondary">SĐT: {record.customerPhone}</Text></div>
                            )}
                            <div><Text type="secondary">{record.itemCount} sản phẩm</Text></div>
                        </div>
                    );
                } else {
                    return (
                        <div style={{ paddingLeft: '20px' }}>
                            <div><Text strong>{record.productName}</Text></div>
                            {record.barcode && <div><Text type="secondary">Mã: {record.barcode}</Text></div>}
                            {record.serial && <div><Text type="secondary">Serial: {record.serial}</Text></div>}
                        </div>
                    );
                }
            },
        },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'center' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return <Text strong>{record.itemCount} SP</Text>;
                }
                return record.quantity;
            },
        },
        {
            title: 'Đơn Giá',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) return null;
                return (
                    <div>
                        <div>{formatCurrency(record.sellPrice)}</div>
                        {record.realSellPrice !== record.sellPrice && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                Thực: {formatCurrency(record.realSellPrice)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Thành Tiền',
            dataIndex: 'totalSellAmount',
            key: 'totalSellAmount',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return <Text strong style={{ color: '#1890ff' }}>{formatCurrency(record.totalOrderAmount)}</Text>;
                }
                return formatCurrency(record.totalSellAmount);
            },
        },
        {
            title: 'Giá Vốn',
            dataIndex: 'costPrice',
            key: 'costPrice',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) return null;
                return formatCurrency(record.costPrice);
            },
        },
        {
            title: 'Tổng Vốn',
            dataIndex: 'totalCostAmount',
            key: 'totalCostAmount',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) return null;
                return formatCurrency(record.totalCostAmount);
            },
        },
        {
            title: 'Lợi Nhuận',
            dataIndex: 'profit',
            key: 'profit',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return (
                        <Text
                            strong
                            style={{ color: record.totalOrderProfit >= 0 ? '#52c41a' : '#f5222d' }}
                        >
                            {formatCurrency(record.totalOrderProfit)}
                        </Text>
                    );
                }
                return (
                    <Text style={{ color: record.profit >= 0 ? '#52c41a' : '#f5222d' }}>
                        {formatCurrency(record.profit)}
                    </Text>
                );
            },
        },
        {
            title: 'Công Nợ',
            dataIndex: 'debt',
            key: 'debt',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return (
                        <Text
                            strong
                            style={{ color: '#ff7a00' }}
                        >
                            {formatCurrency(record.totalOrderDebt)}
                        </Text>
                    );
                }
                return (
                    <Text style={{ color: '#ff7a00' }}>
                        {formatCurrency(record.debt)}
                    </Text>
                );
            },
        },
        {
            title: 'DT Thực Tế',
            dataIndex: 'actualRevenue',
            key: 'actualRevenue',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return (
                        <Text
                            strong
                            style={{ color: '#52c41a' }}
                        >
                            {formatCurrency(record.totalOrderActualRevenue)}
                        </Text>
                    );
                }
                return (
                    <Text style={{ color: '#52c41a' }}>
                        {formatCurrency(record.actualRevenue)}
                    </Text>
                );
            },
        },
        {
            title: 'LN Thực Tế',
            dataIndex: 'actualProfit',
            key: 'actualProfit',
            width: 120,
            align: 'right' as const,
            render: (_: any, record: any) => {
                if (record.isOrderHeader) {
                    return (
                        <Text
                            strong
                            style={{ color: record.totalOrderActualProfit >= 0 ? '#52c41a' : '#f5222d' }}
                        >
                            {formatCurrency(record.totalOrderActualProfit)}
                        </Text>
                    );
                }
                return (
                    <Text style={{ color: record.actualProfit >= 0 ? '#52c41a' : '#f5222d' }}>
                        {formatCurrency(record.actualProfit)}
                    </Text>
                );
            },
        },
    ];

    const handleExportPDF = async () => {
        if (!displayData?.salesDetails) return;

        setIsExporting(true);

        try {
            // Call backend API to generate PDF
            const pdfBlob = await DashboardService.getSalesReportPDF(
                getApiTimeType(timeFilter),
                customRange?.[0]?.toISOString(),
                customRange?.[1]?.toISOString()
            );

            // Create blob URL and download
            const blob = new Blob([pdfBlob], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `bao-cao-chi-tiet-san-pham-${timestamp}.pdf`;

            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            // Show success message
            message.success(`Đã tải xuống file PDF: ${filename}`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            message.error('Có lỗi khi tạo file PDF. Vui lòng thử lại.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2}>
                        <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Báo Cáo Chi Tiết Sản Phẩm Đã Bán
                    </Title>
                    <Text type="secondary">
                        Xem chi tiết từng sản phẩm đã bán, lợi nhuận theo hóa đơn và khách hàng
                    </Text>
                </div>

                {/* Time Filter */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col span={24}>
                        <Space wrap>
                            {timeButtons.map(button => (
                                <Button
                                    key={button.key}
                                    type={timeFilter === button.key ? 'primary' : 'default'}
                                    onClick={() => setTimeFilter(button.key as any)}
                                >
                                    {button.label}
                                </Button>
                            ))}
                        </Space>
                    </Col>
                    {timeFilter === 'custom' && (
                        <Col span={24}>
                            <RangePicker
                                onChange={(dates) => setCustomRange(dates)}
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                    )}
                </Row>

                {/* Export Button */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExportPDF}
                            loading={isExporting}
                            disabled={isLoading || !displayData?.salesDetails?.length}
                        >
                            {isExporting ? 'Đang tạo PDF...' : 'Tải PDF xuống'}
                        </Button>
                    </Col>
                </Row>

                {/* Summary Cards */}
                {reportData?.summary && (
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                        {reportData.summary.totalOrders}
                                    </Text>
                                    <div>
                                        <Text type="secondary">Tổng Hóa Đơn</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: '#722ed1' }}>
                                        {reportData.summary.totalProducts}
                                    </Text>
                                    <div>
                                        <Text type="secondary">Tổng Sản Phẩm</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                                        {formatCurrency(reportData.summary.totalSellPrice)}
                                    </Text>
                                    <div>
                                        <Text type="secondary">Tổng Doanh Thu</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: reportData.summary.totalProfit >= 0 ? '#52c41a' : '#f5222d' }}>
                                        {formatCurrency(reportData.summary.totalProfit)}
                                    </Text>
                                    <div>
                                        <Text type="secondary">Tổng Lợi Nhuận</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: '#ff7a00' }}>
                                        {formatCurrency(reportData.summary.totalDebt || 0)}
                                    </Text>
                                    <div>
                                        <Text type="secondary">Tổng Công Nợ</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                                        {formatCurrency(reportData.summary.actualRevenue || 0)}
                                    </Text>
                                    <div>
                                        <Text type="secondary">DT Thực Tế</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <Text strong style={{ fontSize: '18px', color: (reportData.summary.actualProfit || 0) >= 0 ? '#52c41a' : '#f5222d' }}>
                                        {formatCurrency(reportData.summary.actualProfit || 0)}
                                    </Text>
                                    <div>
                                        <Text type="secondary">LN Thực Tế</Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                )}

                <Divider />

                {/* Data Table with Grouping */}
                <Table
                    columns={columns}
                    dataSource={groupedData}
                    loading={isLoading}
                    scroll={{ x: 1400 }}
                    pagination={{
                        pageSize: 50,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                    }}
                    size="small"
                    rowClassName={(record) => {
                        if (record.isOrderHeader) return 'order-header-row';
                        if (record.isOrderItem) return 'order-item-row';
                        return '';
                    }}
                />

                {/* Summary Footer */}
                {reportData?.summary && (
                    <Card style={{ marginTop: '24px', backgroundColor: '#f5f5f5' }}>
                        <Row gutter={[8, 8]}>
                            <Col span={4}>
                                <Text strong>Tổng cộng: {reportData.summary.totalOrders} hóa đơn</Text>
                            </Col>
                            <Col span={4}>
                                <Text strong>Tổng sản phẩm: {reportData.summary.totalProducts}</Text>
                            </Col>
                            <Col span={4}>
                                <Text strong>Tổng doanh thu: {formatCurrency(reportData.summary.totalSellPrice)}</Text>
                            </Col>
                            <Col span={4}>
                                <Text strong style={{ color: reportData.summary.totalProfit >= 0 ? '#52c41a' : '#f5222d' }}>
                                    Tổng lợi nhuận: {formatCurrency(reportData.summary.totalProfit)}
                                </Text>
                            </Col>
                            <Col span={4}>
                                <Text strong style={{ color: '#ff7a00' }}>
                                    Tổng công nợ: {formatCurrency(reportData.summary.totalDebt || 0)}
                                </Text>
                            </Col>
                            <Col span={3}>
                                <Text strong style={{ color: '#52c41a' }}>
                                    DT thực tế: {formatCurrency(reportData.summary.actualRevenue || 0)}
                                </Text>
                            </Col>
                            <Col span={3}>
                                <Text strong style={{ color: (reportData.summary.actualProfit || 0) >= 0 ? '#52c41a' : '#f5222d' }}>
                                    LN thực tế: {formatCurrency(reportData.summary.actualProfit || 0)}
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Card>

            <style dangerouslySetInnerHTML={{
                __html: `
          .order-header-row {
            background-color: #f0f9ff !important;
          }
          .order-header-row:hover {
            background-color: #e6f7ff !important;
          }
          .order-item-row {
            background-color: #fafafa !important;
          }
          .order-item-row:hover {
            background-color: #f0f0f0 !important;
          }
        `
            }} />
        </div>
    );
};

export default TableReportsPage;
