import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartPoint, CustomTooltipProps } from '../../interface/columchart.interface';
import { formatCurrency } from '../../utils/formatCurrency.util';

interface TopTenRevenueBarChartProps {
    data: ChartPoint[];
    height?: number;
    isQuantityChart?: boolean;
}

const TopTenRevenueBarChart: React.FC<TopTenRevenueBarChartProps> = ({ data, height = 500, isQuantityChart }) => {
    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip"
                    style={{
                        backgroundColor: 'white',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>

                    <p className="value" style={{ margin: 0 }}>
                        {isQuantityChart ?
                            `${payload[0].value} Sản Phẩm`
                            : formatCurrency(payload[0].value)}
                    </p>
                </div>

            );
        }
        return null;
    };


    // Custom cursor component that's invisible
    const CustomCursor = () => null;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                <XAxis
                    type="number"
                    tickFormatter={isQuantityChart
                        ? (value) => `${value} Sản Phẩm`
                        : (value) => `${value / 1000000}M`
                    }
                />
                <YAxis
                    type="category"
                    dataKey="date"
                    width={180}
                    tickMargin={5}
                    tickFormatter={(value) => {
                        // Truncate text if too long, keeping the beginning
                        const maxChars = 19;
                        return value.length > maxChars ? value.substring(0, maxChars) + '...' : value;
                    }}
                    tick={{ textAnchor: 'end' }}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomCursor />}
                />
                <Bar
                    dataKey="value"
                    fill="#0070F4"
                    name="Doanh thu"
                    barSize={30}
                    activeBar={{ stroke: 'none', strokeWidth: 0, fill: '#0070F4' }}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopTenRevenueBarChart;