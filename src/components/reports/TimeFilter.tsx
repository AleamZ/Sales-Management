import React from 'react';
import { Select, DatePicker, Space, Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export type TimeFilterType = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'CUSTOM';

interface TimeFilterProps {
    value: TimeFilterType;
    onChange: (value: TimeFilterType, dateRange?: [dayjs.Dayjs, dayjs.Dayjs]) => void;
    customDateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

const timeOptions = [
    { label: 'Hôm nay', value: 'TODAY' },
    { label: 'Hôm qua', value: 'YESTERDAY' },
    { label: 'Tuần này', value: 'THIS_WEEK' },
    { label: 'Tháng này', value: 'THIS_MONTH' },
    { label: 'Tháng trước', value: 'LAST_MONTH' },
    { label: 'Quý này', value: 'THIS_QUARTER' },
    { label: 'Năm này', value: 'THIS_YEAR' },
    { label: 'Tùy chỉnh', value: 'CUSTOM' },
];

const TimeFilter: React.FC<TimeFilterProps> = ({
    value,
    onChange,
    customDateRange
}) => {
    const handleTimeTypeChange = (newValue: TimeFilterType) => {
        onChange(newValue);
    };

    const handleDateRangeChange = (dates: any) => {
        if (dates && dates.length === 2) {
            onChange('CUSTOM', [dates[0], dates[1]]);
        }
    };

    return (
        <Card
            style={{
                marginBottom: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: '16px' }}
        >
            <Space size="middle" wrap>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined style={{ color: '#1677ff' }} />
                    <span style={{ fontWeight: 500 }}>Thời gian:</span>
                </div>

                <Select
                    value={value}
                    onChange={handleTimeTypeChange}
                    style={{ minWidth: '150px' }}
                    options={timeOptions}
                />

                {value === 'CUSTOM' && (
                    <RangePicker
                        value={customDateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ minWidth: '250px' }}
                    />
                )}
            </Space>
        </Card>
    );
};

export default TimeFilter; 