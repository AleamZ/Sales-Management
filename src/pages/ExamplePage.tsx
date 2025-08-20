import React from 'react';
import { Card, message } from 'antd';
import CustomerSearch from '../components/customers/CustomerSearch';
import { Customer } from '../interface/customer.interface';

const ExamplePage: React.FC = () => {
    const handleCustomerSelect = (customer: Customer) => {
        message.success(`Đã chọn khách hàng: ${customer.name}`);
        // Do something with the selected customer
    };

    return (
        <Card title="Tìm kiếm khách hàng">
            <CustomerSearch onCustomerSelect={handleCustomerSelect} />
        </Card>
    );
};

export default ExamplePage;
