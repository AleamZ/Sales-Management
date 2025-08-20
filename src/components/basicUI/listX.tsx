import React, { useState, useEffect } from 'react';
import { List, Input, Checkbox, Typography, Empty } from 'antd';
import { SearchOutlined, CaretDownOutlined, CaretRightOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../styles/basicUI/listX.scss';

const { Text, Title } = Typography;

export interface ListXItem {
    id: string | number;
    title: string;
    description?: string;
    parentId?: string | number | null;
    children?: ListXItem[];
    [key: string]: unknown;
}

export interface ListXProps {
    title?: string;
    isSearch?: boolean;
    textSearch?: string;
    isCheckbox?: boolean;
    isCheckboxSingle?: boolean;
    value?: ListXItem[];
    onItemSelect?: (selectedItems: ListXItem[] | ListXItem | null) => void;
    onSearch?: (searchValue: string) => void;
    emptyText?: string;
    className?: string;
    isHierarchical?: boolean; // Flag to enable hierarchical display
    indentSize?: number; // Size of indentation in pixels
    isCollapsible?: boolean; // Allow collapsing the entire component
    defaultCollapsed?: boolean; // Default collapse state
    isAdd?: boolean; // Show add icon in title
    onAddClick?: () => void; // Callback when add icon is clicked - fix parameter type
    loading?: boolean; // Loading state
    isEdit?: boolean; // Show edit icon on item hover
    onEditClick?: (item: ListXItem) => void; // Callback when edit icon is clicked
    isDelete?: boolean; // Show delete icon on item hover
    onDeleteClick?: (item: ListXItem) => void; // Callback when delete icon is clicked
}

const ListX: React.FC<ListXProps> = ({
    title,
    isSearch = false,
    textSearch = '',
    isCheckbox = false,
    isCheckboxSingle = false,
    value = [],
    onItemSelect,
    onSearch,
    emptyText = 'Không có dữ liệu',
    className = '',
    isHierarchical = false,
    indentSize = 20,
    isCollapsible = false,
    defaultCollapsed = false,
    isAdd = false,
    onAddClick,
    loading,
    isEdit = false,
    onEditClick,
    isDelete = false,
    onDeleteClick,
}) => {
    const [searchValue, setSearchValue] = useState<string>(textSearch);
    const [filteredItems, setFilteredItems] = useState<ListXItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<ListXItem[]>([]);
    const [expandedItems, setExpandedItems] = useState<Set<string | number>>(new Set());
    const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);

    // Convert flat array to hierarchical structure if isHierarchical is true
    useEffect(() => {
        if (isHierarchical) {
            // First filter by search if needed
            let filtered = value;
            if (searchValue) {
                filtered = value.filter((item) =>
                    item.title.toLowerCase().includes(searchValue.toLowerCase())
                );
            }

            // Process items into hierarchical structure
            const hierarchicalItems = processHierarchicalItems(filtered);
            setFilteredItems(hierarchicalItems);
        } else {
            // Original flat list behavior
            if (searchValue) {
                const filtered = value.filter((item) =>
                    item.title.toLowerCase().includes(searchValue.toLowerCase())
                );
                setFilteredItems(filtered);
            } else {
                setFilteredItems(value);
            }
        }
    }, [value, searchValue, isHierarchical]);

    // Process items into hierarchical structure
    const processHierarchicalItems = (items: ListXItem[]): ListXItem[] => {
        // Create a map of all items
        const itemMap = new Map<string | number, ListXItem>();
        items.forEach(item => {
            // Create a new copy of the item with an empty children array
            itemMap.set(item.id, { ...item, children: [] });
        });

        // Root items will be collected here
        const rootItems: ListXItem[] = [];

        // Organize items into parent-child relationships
        items.forEach(item => {
            const itemWithChildren = itemMap.get(item.id);
            if (!itemWithChildren) return;

            if (item.parentId && itemMap.has(item.parentId)) {
                // This is a child item
                const parent = itemMap.get(item.parentId);
                if (parent && parent.children) {
                    parent.children.push(itemWithChildren);
                }
            } else {
                // This is a root item
                rootItems.push(itemWithChildren);
            }
        });

        return rootItems;
    };

    // Flatten hierarchical items for rendering with proper indentation levels
    const flattenForRender = (items: ListXItem[], level = 1): { item: ListXItem; level: number }[] => {
        let result: { item: ListXItem; level: number }[] = [];

        items.forEach(item => {
            result.push({ item, level });

            // If item is expanded and has children, add its children too
            if (expandedItems.has(item.id) && item.children && item.children.length > 0) {
                result = [...result, ...flattenForRender(item.children, level + 1)];
            }
        });

        return result;
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    // Handle checkbox change for an item
    const handleCheckboxChange = (item: ListXItem, checked: boolean) => {
        let newSelectedItems: ListXItem[] = [];

        if (isCheckboxSingle) {
            // Single selection mode
            newSelectedItems = checked ? [item] : [];
            setSelectedItems(newSelectedItems);
            if (onItemSelect) {
                onItemSelect(checked ? item : null);
            }
        } else {
            // Multiple selection mode
            if (checked) {
                newSelectedItems = [...selectedItems, item];
            } else {
                newSelectedItems = selectedItems.filter((selectedItem) => selectedItem.id !== item.id);
            }
            setSelectedItems(newSelectedItems);
            if (onItemSelect) {
                onItemSelect(newSelectedItems);
            }
        }
    };

    // Toggle expand/collapse for an item with children
    const toggleExpand = (itemId: string | number) => {
        const newExpandedItems = new Set(expandedItems);
        if (expandedItems.has(itemId)) {
            newExpandedItems.delete(itemId);
        } else {
            newExpandedItems.add(itemId);
        }
        setExpandedItems(newExpandedItems);
    };

    // Toggle collapsed state of the entire component
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // Handle add button click
    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddClick) {
            onAddClick(); // Call without parameters
        }
    };

    // Handle edit icon click
    const handleEditClick = (e: React.MouseEvent, item: ListXItem) => {
        e.stopPropagation();
        if (onEditClick) {
            onEditClick(item);
        }
    };

    // Handle delete icon click
    const handleDeleteClick = (e: React.MouseEvent, item: ListXItem) => {
        e.stopPropagation();
        if (onDeleteClick) {
            onDeleteClick(item);
        }
    };

    // Check if an item is selected
    const isItemSelected = (item: ListXItem) => {
        return selectedItems.some((selectedItem) => selectedItem.id === item.id);
    };

    // Render list items based on hierarchical or flat structure
    const renderListItems = () => {
        if (isHierarchical) {
            const itemsToRender = flattenForRender(filteredItems);

            return (
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={itemsToRender}
                    renderItem={({ item, level }) => (
                        <List.Item
                            className={`list-x-item ${isItemSelected(item) ? 'list-x-item-selected' : ''}`}
                            style={{ paddingLeft: level * indentSize + 'px' }}
                            onClick={() => {
                                if (isCheckbox) {
                                    handleCheckboxChange(item, !isItemSelected(item));
                                } else if (onItemSelect) {
                                    onItemSelect(item);
                                }
                            }}
                        >
                            {item.children && item.children.length > 0 && (
                                <span
                                    className="list-x-expand-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(item.id);
                                    }}
                                >
                                    {expandedItems.has(item.id) ? <CaretDownOutlined /> : <CaretRightOutlined />}
                                </span>
                            )}

                            {isCheckbox && (
                                <Checkbox
                                    checked={isItemSelected(item)}
                                    onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}

                            <div className="list-x-item-content">
                                <Text className="list-x-item-title">{item.title}</Text>
                                {item.description && (
                                    <Text className="list-x-item-description" type="secondary">
                                        {item.description}
                                    </Text>
                                )}
                            </div>

                            <div className="list-x-item-actions">
                                {isEdit && (
                                    <span
                                        className="list-x-edit-icon"
                                        onClick={(e) => handleEditClick(e, item)}
                                    >
                                        <EditOutlined />
                                    </span>
                                )}
                                {isDelete && (
                                    <span
                                        className="list-x-delete-icon"
                                        onClick={(e) => handleDeleteClick(e, item)}
                                    >
                                        <DeleteOutlined />
                                    </span>
                                )}
                            </div>
                        </List.Item>
                    )}
                />
            );
        } else {
            // Original flat list rendering
            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={filteredItems}
                renderItem={(item) => (
                    <List.Item
                        className={`list-x-item ${isItemSelected(item) ? 'list-x-item-selected' : ''}`}
                        onClick={() => {
                            if (isCheckbox) {
                                handleCheckboxChange(item, !isItemSelected(item));
                            } else if (onItemSelect) {
                                onItemSelect(item);
                            }
                        }}
                    >
                        {isCheckbox && (
                            <div className='list-x-checkbox-container'>
                                <Checkbox
                                    checked={isItemSelected(item)}
                                    onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                        <div className="list-x-item-content">
                            <Text className="list-x-item-title">{item.title}</Text>
                            {item.description && (
                                <Text className="list-x-item-description" type="secondary">
                                    {item.description}
                                </Text>
                            )}
                        </div>

                        <div className="list-x-item-actions">
                            {isEdit && (
                                <span
                                    className="list-x-edit-icon"
                                    onClick={(e) => handleEditClick(e, item)}
                                >
                                    <EditOutlined />
                                </span>
                            )}
                            {isDelete && (
                                <span
                                    className="list-x-delete-icon"
                                    onClick={(e) => handleDeleteClick(e, item)}
                                >
                                    <DeleteOutlined />
                                </span>
                            )}
                        </div>
                    </List.Item>
                )}
            />

        }
    };

    return (
        <div className={`list-x-container ${className} ${collapsed ? 'list-x-collapsed' : ''}`}>
            {title && (
                <div className="list-x-title-container">
                    <div className="list-x-title-content" onClick={isCollapsible ? toggleCollapsed : undefined}>
                        {isCollapsible && (
                            <span className="list-x-collapse-icon">
                                {collapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
                            </span>
                        )}
                        <Title level={5} className="list-x-title">{title}</Title>
                    </div>
                    {isAdd && (
                        <span className="list-x-add-icon" onClick={handleAddClick}>
                            <PlusOutlined />
                        </span>
                    )}
                </div>
            )}

            <div className="list-x-content-wrapper" style={{ display: collapsed ? 'none' : 'block' }}>
                {isSearch && (
                    <div className="list-x-search">
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            value={searchValue}
                            onChange={handleSearchChange}
                            allowClear
                        />
                    </div>
                )}

                <div className="list-x-content">
                    {filteredItems.length > 0 ? renderListItems() : <Empty description={emptyText} />}
                </div>
            </div>
        </div>
    );
};

export default ListX;