import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartPoint, CustomTooltipProps } from '../../interface/columchart.interface';
import { formatCurrency } from '../../utils/formatCurrency.util';

interface RevenueBarChartProps {
    data: ChartPoint[];
    height?: number;
    showProfit?: boolean;
    showDebt?: boolean;
}

const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data, height = 300, showProfit = false, showDebt = false }) => {
    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'white',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                    textAlign: 'left'
                }}>
                    <p className="revenue" style={{ margin: '4px 0' }}>
                        Doanh thu: {formatCurrency(payload[0]?.value ?? 0)}
                    </p>
                    {showDebt && payload[1] && (
                        <p className="debt" style={{ margin: '4px 0' }}>
                            Công nợ: {formatCurrency(payload[1]?.value ?? 0)}
                        </p>
                    )}
                    {showDebt && payload[2] && (
                        <p className="actualRevenue" style={{ margin: '4px 0', fontWeight: 'bold' }}>
                            Doanh thu thực tế: {formatCurrency(payload[2]?.value ?? 0)}
                        </p>
                    )}
                    {showProfit && !showDebt && payload[1] && (
                        <p className="profit" style={{ margin: '4px 0' }}>
                            Lợi nhuận: {formatCurrency(payload[1]?.value ?? 0)}
                        </p>
                    )}
                    {showProfit && showDebt && payload[3] && (
                        <p className="profit" style={{ margin: '4px 0' }}>
                            Lợi nhuận: {formatCurrency(payload[3]?.value ?? 0)}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const CustomCursor = () => null;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomCursor />}
                />
                {(showProfit || showDebt) && <Legend />}
                <Bar
                    dataKey="revenue"
                    fill="#0070F4"
                    name="Doanh thu"
                    barSize={showDebt ? 35 : 50}
                    activeBar={{ stroke: 'none', strokeWidth: 0, fill: '#0070F4' }}
                />
                {showDebt && (
                    <Bar
                        dataKey="debt"
                        fill="#ff7a00"
                        name="Công nợ"
                        barSize={35}
                        activeBar={{ stroke: 'none', strokeWidth: 0, fill: '#ff7a00' }}
                    />
                )}
                {showDebt && (
                    <Bar
                        dataKey="actualRevenue"
                        fill="#52c41a"
                        name="Doanh thu thực tế"
                        barSize={35}
                        activeBar={{ stroke: 'none', strokeWidth: 0, fill: '#52c41a' }}
                    />
                )}
                {showProfit && (
                    <Bar
                        dataKey="profit"
                        fill="#10B981"
                        name="Lợi nhuận"
                        barSize={showDebt ? 35 : 50}
                        activeBar={{ stroke: 'none', strokeWidth: 0, fill: '#10B981' }}
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default RevenueBarChart;