import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.util';

interface LineChartData {
    date: string;
    revenue?: number;
    orders?: number;
    profit?: number;
}

interface CustomLineChartProps {
    data: LineChartData[];
    title: string;
    height?: number;
    showRevenue?: boolean;
    showOrders?: boolean;
    showProfit?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ margin: '4px 0 0 0', color: entry.color }}>
                        {entry.name}: {
                            entry.dataKey === 'orders'
                                ? `${entry.value} đơn`
                                : formatCurrency(entry.value)
                        }
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const CustomLineChart: React.FC<CustomLineChartProps> = ({
    data,
    title,
    height = 300,
    showRevenue = true,
    showOrders = false,
    showProfit = false
}) => {
    return (
        <div style={{ width: '100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {showRevenue && (
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#0070F4"
                            strokeWidth={3}
                            name="Doanh thu"
                            dot={{ fill: '#0070F4', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    )}
                    {showOrders && (
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke="#FF8042"
                            strokeWidth={3}
                            name="Số đơn hàng"
                            dot={{ fill: '#FF8042', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                            yAxisId="right"
                        />
                    )}
                    {showProfit && (
                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#10B981"
                            strokeWidth={3}
                            name="Lợi nhuận"
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomLineChart; 