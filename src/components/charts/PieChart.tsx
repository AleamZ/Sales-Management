import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.util';

interface PieChartData {
    name: string;
    value: number;
    percentage?: number;
}

interface CustomPieChartProps {
    data: PieChartData[];
    title: string;
    height?: number;
    isRevenue?: boolean;
}

const COLORS = ['#52c41a', '#ff7a00', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CustomTooltip = ({ active, payload, isRevenue }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
                <p style={{ margin: '4px 0 0 0', color: payload[0].color }}>
                    {isRevenue ? formatCurrency(data.value) : `${data.value} sản phẩm`}
                </p>
                {data.percentage && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                        {data.percentage.toFixed(1)}%
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const CustomPieChart: React.FC<CustomPieChartProps> = ({
    data,
    title,
    height = 300,
    isRevenue = false
}) => {
    return (
        <div style={{ width: '100%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage?.toFixed(1)}%`}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isRevenue={isRevenue} />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomPieChart; 