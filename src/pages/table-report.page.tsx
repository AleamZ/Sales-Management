import React, { useState } from 'react';
import { Row, Col, Card, Typography, Select, Button, Table, Spin, DatePicker } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatCurrency.util';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

type TimeFilterType = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'CUSTOM';

const TableReportPage: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<TimeFilterType>('THIS_MONTH');
    const [customDateRange, setCustomDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>();



    const customFromDate = customDateRange?.[0]?.toDate();
    const customToDate = customDateRange?.[1]?.toDate();

    // Mock data cho báo cáo theo kênh bán hàng
    const mockReportData = {
        period: {
            from: customFromDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            to: customToDate || new Date()
        },
        reportData: [
            {
                channel: 'Tại cửa hàng',
                totalAmount: 50000000,
                discount: 2000000,
                revenue: 48000000,
                refund: 1000000,
                netRevenue: 47000000,
                costPrice: 35000000,
                grossProfit: 12000000,
                shippingFee: 0,
                finalProfit: 12000000
            },
            {
                channel: 'Online',
                totalAmount: 30000000,
                discount: 1500000,
                revenue: 28500000,
                refund: 500000,
                netRevenue: 28000000,
                costPrice: 20000000,
                grossProfit: 8000000,
                shippingFee: 800000,
                finalProfit: 7200000
            },
            {
                channel: 'Điện thoại',
                totalAmount: 10000000,
                discount: 300000,
                revenue: 9700000,
                refund: 200000,
                netRevenue: 9500000,
                costPrice: 7000000,
                grossProfit: 2500000,
                shippingFee: 0,
                finalProfit: 2500000
            }
        ],
        summary: {
            totalAmount: 90000000,
            totalDiscount: 3800000,
            totalRevenue: 86200000,
            totalRefund: 1700000,
            netRevenue: 84500000,
            totalCostPrice: 62000000,
            grossProfit: 22500000,
            shippingFee: 800000,
            finalProfit: 21700000
        }
    };

    // Sử dụng mock data thay vì API call
    const reportData = mockReportData;
    const isLoading = false;

    const getTimeFilterLabel = (filter: TimeFilterType) => {
        const labels = {
            'TODAY': 'Hôm nay',
            'YESTERDAY': 'Hôm qua',
            'THIS_WEEK': 'Tuần này',
            'THIS_MONTH': 'Tháng này',
            'THIS_QUARTER': 'Quý này',
            'THIS_YEAR': 'Năm này',
            'CUSTOM': 'Tùy chọn'
        };
        return labels[filter];
    };

    const handleTimeFilterChange = (value: TimeFilterType) => {
        setTimeFilter(value);
        if (value !== 'CUSTOM') {
            setCustomDateRange(undefined);
        }
    };

    const handleCustomDateChange = (dates: any) => {
        if (dates && dates.length === 2) {
            setCustomDateRange([dates[0], dates[1]]);
        }
    };

    const columns = [
        {
            title: 'Kênh bán hàng',
            dataIndex: 'channel',
            key: 'channel',
            width: 150,
        },
        {
            title: 'Tổng tiền hàng',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Giá trị trả',
            dataIndex: 'refund',
            key: 'refund',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Doanh thu thuần',
            dataIndex: 'netRevenue',
            key: 'netRevenue',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Tổng giá vốn',
            dataIndex: 'costPrice',
            key: 'costPrice',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Lợi nhuận gộp',
            dataIndex: 'grossProfit',
            key: 'grossProfit',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Phí trả ĐTGH',
            dataIndex: 'shippingFee',
            key: 'shippingFee',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Lợi nhuận gộp + Phí trả ĐTGH',
            dataIndex: 'finalProfit',
            key: 'finalProfit',
            align: 'right' as const,
            render: (value: number) => formatCurrency(value),
        },
    ];

    const handleExportPDF = () => {
        try {
            // Kiểm tra dữ liệu trước khi tạo PDF
            if (!reportData || !reportData.reportData || reportData.reportData.length === 0) {
                console.error('Không có dữ liệu để xuất PDF');
                return;
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                console.error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
                return;
            }

            const htmlContent = generatePDFContent();
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Đợi content load xong rồi mới print
            printWindow.onload = () => {
                printWindow.print();
            };
        } catch (error) {
            console.error('Lỗi khi tạo PDF:', error);
        }
    };

    const generatePDFContent = () => {
        try {
            const currentDate = dayjs().format('DD/MM/YYYY HH:mm');

            // Xử lý an toàn cho ngày tháng
            let fromDate = 'N/A';
            let toDate = 'N/A';

            if (customDateRange?.[0] && customDateRange?.[1]) {
                fromDate = customDateRange[0].format('DD/MM/YYYY');
                toDate = customDateRange[1].format('DD/MM/YYYY');
            } else if (reportData?.period?.from && reportData?.period?.to) {
                fromDate = dayjs(reportData.period.from).format('DD/MM/YYYY');
                toDate = dayjs(reportData.period.to).format('DD/MM/YYYY');
            }

            // Tạo rows dữ liệu an toàn
            const dataRows = reportData?.reportData?.map((item: any) => {
                const safeItem = {
                    channel: item?.channel || 'N/A',
                    totalAmount: item?.totalAmount || 0,
                    discount: item?.discount || 0,
                    revenue: item?.revenue || 0,
                    refund: item?.refund || 0,
                    netRevenue: item?.netRevenue || 0,
                    costPrice: item?.costPrice || 0,
                    grossProfit: item?.grossProfit || 0,
                    shippingFee: item?.shippingFee || 0,
                    finalProfit: item?.finalProfit || 0
                };

                return `
                    <tr>
                        <td class="channel-col">${safeItem.channel}</td>
                        <td>${formatCurrency(safeItem.totalAmount)}</td>
                        <td>${formatCurrency(safeItem.discount)}</td>
                        <td>${formatCurrency(safeItem.revenue)}</td>
                        <td>${formatCurrency(safeItem.refund)}</td>
                        <td>${formatCurrency(safeItem.netRevenue)}</td>
                        <td>${formatCurrency(safeItem.costPrice)}</td>
                        <td>${formatCurrency(safeItem.grossProfit)}</td>
                        <td>${formatCurrency(safeItem.shippingFee)}</td>
                        <td>${formatCurrency(safeItem.finalProfit)}</td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="10" style="text-align: center;">Không có dữ liệu</td></tr>';

            // Summary an toàn
            const summary = reportData?.summary || {};
            const safeSummary = {
                totalAmount: summary.totalAmount || 0,
                totalDiscount: summary.totalDiscount || 0,
                totalRevenue: summary.totalRevenue || 0,
                totalRefund: summary.totalRefund || 0,
                netRevenue: summary.netRevenue || 0,
                totalCostPrice: summary.totalCostPrice || 0,
                grossProfit: summary.grossProfit || 0,
                shippingFee: summary.shippingFee || 0,
                finalProfit: summary.finalProfit || 0
            };

            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Báo cáo lợi nhuận theo kênh bán hàng</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 14px; margin-bottom: 5px; }
        .info { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .channel-col { text-align: left; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        @media print { 
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Báo cáo lợi nhuận theo kênh bán hàng</div>
        <div class="subtitle">Từ ngày ${fromDate} đến ngày ${toDate}</div>
        <div class="info">Chi nhánh: Chi nhánh trung tâm</div>
        <div class="info">Ngày tạo: ${currentDate}</div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th class="channel-col">Kênh bán hàng</th>
                <th>Tổng tiền hàng</th>
                <th>Giảm giá</th>
                <th>Doanh thu</th>
                <th>Giá trị trả</th>
                <th>Doanh thu thuần</th>
                <th>Tổng giá vốn</th>
                <th>Lợi nhuận gộp</th>
                <th>Phí trả ĐTGH</th>
                <th>Lợi nhuận gộp + Phí trả ĐTGH</th>
            </tr>
        </thead>
        <tbody>
            ${dataRows}
            <tr class="total-row">
                <td class="channel-col">Tổng cộng</td>
                <td>${formatCurrency(safeSummary.totalAmount)}</td>
                <td>${formatCurrency(safeSummary.totalDiscount)}</td>
                <td>${formatCurrency(safeSummary.totalRevenue)}</td>
                <td>${formatCurrency(safeSummary.totalRefund)}</td>
                <td>${formatCurrency(safeSummary.netRevenue)}</td>
                <td>${formatCurrency(safeSummary.totalCostPrice)}</td>
                <td>${formatCurrency(safeSummary.grossProfit)}</td>
                <td>${formatCurrency(safeSummary.shippingFee)}</td>
                <td>${formatCurrency(safeSummary.finalProfit)}</td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;
        } catch (error) {
            console.error('Lỗi khi tạo nội dung PDF:', error);
            return '<html><body><h1>Lỗi: Không thể tạo báo cáo</h1></body></html>';
        }
    };

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: '#1677ff' }}>
                        <FileTextOutlined style={{ marginRight: '12px' }} />
                        Báo Cáo Dạng Bảng
                    </Title>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        Báo cáo lợi nhuận theo kênh bán hàng
                    </p>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <span style={{ marginRight: '8px' }}>Thời gian:</span>
                        <Select
                            value={timeFilter}
                            onChange={handleTimeFilterChange}
                            style={{ width: 150 }}
                        >
                            <Option value="TODAY">Hôm nay</Option>
                            <Option value="YESTERDAY">Hôm qua</Option>
                            <Option value="THIS_WEEK">Tuần này</Option>
                            <Option value="THIS_MONTH">Tháng này</Option>
                            <Option value="THIS_QUARTER">Quý này</Option>
                            <Option value="THIS_YEAR">Năm này</Option>
                            <Option value="CUSTOM">Tùy chọn</Option>
                        </Select>
                    </Col>
                    {timeFilter === 'CUSTOM' && (
                        <Col>
                            <RangePicker
                                value={customDateRange}
                                onChange={handleCustomDateChange}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                    )}
                    <Col>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExportPDF}
                            disabled={isLoading || !reportData}
                        >
                            Xuất PDF
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Report Table */}
            <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={4}>
                        Báo cáo lợi nhuận theo kênh bán hàng - {getTimeFilterLabel(timeFilter)}
                    </Title>
                    {reportData && (
                        <p style={{ color: '#666', margin: 0 }}>
                            Từ {dayjs(reportData.period.from).format('DD/MM/YYYY')} đến {dayjs(reportData.period.to).format('DD/MM/YYYY')}
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '16px' }}>Đang tải dữ liệu báo cáo...</p>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={reportData?.reportData || []}
                        pagination={false}
                        rowKey="channel"
                        scroll={{ x: 1200 }}
                        summary={() => {
                            const summary = reportData?.summary;
                            if (!summary) return null;

                            return (
                                <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                                    <Table.Summary.Cell index={0}>Tổng cộng</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        {formatCurrency(summary.totalAmount)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right">
                                        {formatCurrency(summary.totalDiscount)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} align="right">
                                        {formatCurrency(summary.totalRevenue)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="right">
                                        {formatCurrency(summary.totalRefund)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5} align="right">
                                        {formatCurrency(summary.netRevenue)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={6} align="right">
                                        {formatCurrency(summary.totalCostPrice)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={7} align="right">
                                        {formatCurrency(summary.grossProfit)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={8} align="right">
                                        {formatCurrency(summary.shippingFee)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={9} align="right">
                                        {formatCurrency(summary.finalProfit)}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default TableReportPage; 