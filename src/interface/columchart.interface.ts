export interface ChartPoint {
    date: string;
    revenue: number;
    profit?: number;
    value?: number; // Keep for backward compatibility
}

export interface ColumnChartData {
    totalRevenue: number;
    chartDay: ChartPoint[];
    chartHour: ChartPoint[];
    chartWeek: ChartPoint[];
}

export interface TooltipPayloadItem {
    name: string;
    value: number | string;
    color?: string;
}
export interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        name: string;
    }>;
    label?: string;
}
export interface TooltipProps {
    active?: boolean;
    payload?: unknown[];
    label?: string;
}
