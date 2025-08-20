import React, { useState, useEffect } from 'react';
import { Input, List, Avatar, Spin, Empty } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import customerService from '../../services/customer.service';
import { Customer } from '../../interface/customer.interface';

interface CustomerSearchProps {
    onCustomerSelect: (customer: Customer) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
    onCustomerSelect,
    placeholder = "Tìm kiếm khách hàng...",
    style
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Set up debouncing for search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // React Query for customer search
    const {
        data: customerData,
        isLoading,
        error
    } = useQuery({
        queryKey: ['customers', 'search', debouncedSearchTerm],
        queryFn: async () => {
            if (!debouncedSearchTerm.trim()) return { data: { customers: [], total: 0 } };

            // Use the getCustomers function to search for customers with the keyword parameter
            return await customerService.get({ keyword: debouncedSearchTerm });
        },
        enabled: debouncedSearchTerm.trim() !== '',
    });

    // Show/hide search results based on search term and focus
    const customers = customerData?.data?.customers || [];

    return (
        <div style={{ position: 'relative', ...style }}>
            <Input
                placeholder={placeholder}
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => {
                    // Use setTimeout to allow click events on the dropdown to fire before hiding
                    setTimeout(() => setShowResults(false), 200);
                }}
            />

            {showResults && (debouncedSearchTerm.trim() !== '' || isLoading) && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        borderRadius: '0 0 4px 4px',
                        maxHeight: '300px',
                        overflow: 'auto',
                    }}
                >
                    {isLoading ? (
                        <div style={{ padding: '16px', textAlign: 'center' }}>
                            <Spin size="small" /> <span style={{ marginLeft: 8 }}>Đang tìm kiếm...</span>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'red' }}>
                            Có lỗi xảy ra khi tìm kiếm
                        </div>
                    ) : customers.length > 0 ? (
                        <List
                            itemLayout="horizontal"
                            dataSource={customers}
                            renderItem={(customer) => (
                                <List.Item
                                    key={customer._id}
                                    style={{ padding: '8px 12px', cursor: 'pointer' }}
                                    onClick={() => {
                                        onCustomerSelect(customer);
                                        setSearchTerm('');
                                        setShowResults(false);
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} />}
                                        title={customer.name}
                                        description={
                                            <>
                                                {customer.phone && <div>SĐT: {customer.phone}</div>}
                                                {customer.email && <div>Email: {customer.email}</div>}
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="Không tìm thấy khách hàng" style={{ padding: '16px' }} />
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerSearch;
