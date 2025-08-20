import { Row, Col, Button, Input, List, Image, Spin } from "antd";
import {
    PlusOutlined,
    LeftOutlined,
    RightOutlined,
    CloseOutlined,
    UserOutlined,
    MenuOutlined,
} from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/products.service";
import { useSalesContext } from "../../context/SalesContext";
import { ProductData } from "../../interface/product.interface";

const SalesHeader = () => {
    const { activeBillId, setActiveBillId } = useSalesContext();
    const [bills, setBills] = useState([{ id: 1, title: "Hóa đơn 1" }]);
    const [startIndex, setStartIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const maxVisibleTabs = 5;
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Set up debouncing for search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // React Query for product search
    const {
        data: searchData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["products", "search", debouncedSearchTerm],
        queryFn: async () => {
            if (!debouncedSearchTerm.trim()) return { products: [], total: 0 };
            return await getProducts({ keyword: debouncedSearchTerm, limit: 8 });
        },
        enabled: debouncedSearchTerm.trim() !== "",
    });

    // Extract search results from the query data
    const searchResults = searchData?.products || [];

    // Show/hide search results based on search term and results
    useEffect(() => {
        if (debouncedSearchTerm.trim() !== "") {
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    }, [debouncedSearchTerm, searchData]);

    const addNewBill = () => {
        // Get all existing IDs
        const existingIds = bills.map((bill) => bill.id);

        // Find the smallest available ID
        let newBillId = 1;
        while (existingIds.includes(newBillId)) {
            newBillId++;
        }

        // Add the new bill and set it as active
        setBills([...bills, { id: newBillId, title: `Hóa đơn ${newBillId}` }]);
        setActiveBillId(newBillId.toString());
    };

    const handleTabChange = (key: string) => {
        setActiveBillId(key);
    };

    const handleCloseTab = (e: React.MouseEvent, targetKey: string) => {
        e.stopPropagation();

        // Don't allow closing the last tab
        if (bills.length <= 1) return;

        const newBills = bills.filter((bill) => bill.id.toString() !== targetKey);
        setBills(newBills);

        // If closing the active tab, switch to the first remaining tab
        if (targetKey === activeBillId) {
            setActiveBillId(newBills[0].id.toString());
        }

        // Adjust the startIndex if needed
        if (startIndex > 0 && startIndex >= newBills.length - maxVisibleTabs + 1) {
            setStartIndex(Math.max(0, newBills.length - maxVisibleTabs));
        }
    };

    const showPrevTabs = () => {
        setStartIndex(Math.max(0, startIndex - 1));
    };

    const showNextTabs = () => {
        setStartIndex(Math.min(bills.length - maxVisibleTabs, startIndex + 1));
    };

    const showNavigationArrows = bills.length > maxVisibleTabs;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        // The actual search is now handled by React Query via debouncedSearchTerm
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

  const handleProductSelect = (product: ProductData) => {
    const salesProduct = {
      productId: product._id,
      barcode: product.barcode,
      imageUrl: product.mainImage
        ? [product.mainImage]
        : product.listImage && product.listImage.length > 0
        ? product.listImage
        : [""],
      productName: product.name,
      sellingPrice: product.sellPrice || 0,
      costPrice: product.costPrice || 0,
      inventory: product.stock || 0,
      isSerial: product.isSerial || false,
      serial: product.serials
        ? product.serials.map((serialNumber, index) => ({
            variableId: `${product._id}-s-${index}`,
            serialNumber,
            isSold: false,
          }))
        : [],
      isVarriant: product.isVariable || false,
      variants: product.variables
        ? product.variables.map((variant) => ({
            variantId: variant._id,
            attributes: variant.attribute,
            costPrice: variant.costPrice,
            sellingPrice: variant.sellPrice,
            inventory: variant.stock,
            imageUrl: variant.mainImage
              ? [variant.mainImage]
              : variant.listImage && variant.listImage.length > 0
              ? variant.listImage
              : [""],
            isSerial: variant.isSerial,
            serials: variant.serials
              ? variant.serials.map((serialNumber) => ({
                  serialNumber,
                }))
              : [],
          }))
        : [],
      // Add any other fields required by the SalesPage component
    };
    // Create and dispatch a custom event with the selected product and active bill ID
    const event = new CustomEvent("productSelected", {
      detail: {
        product: salesProduct,
        billId: activeBillId,
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
    setShowResults(false); // Hide results after selection
    setSearchTerm(""); // Clear search input
  };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Row className="sales-header" gutter={[0, 0]}>
            <Col span={6} className="search-container">
                <div className="search-wrapper" ref={searchRef}>
                    <Input.Search
                        placeholder="Tìm kiếm sản phẩm..."
                        size="large"
                        className="sales-search"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        onSearch={(value) => setSearchTerm(value)}
                        loading={isLoading}
                    />
                    {showResults && (
                        <div className="search-results">
                            {isLoading ? (
                                <div className="search-loading">
                                    <Spin size="small" />
                                    <span style={{ marginLeft: 10 }}>Đang tìm kiếm...</span>
                                </div>
                            ) : error ? (
                                <div className="search-error">
                                    Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.
                                </div>
                            ) : searchResults.length > 0 ? (
                                <List
                                    dataSource={searchResults}
                                    renderItem={(item: ProductData) => (
                                        <List.Item
                                            className="search-result-item"
                                            onClick={() => handleProductSelect(item)}
                                        >
                                            <Row style={{ width: "100%" }}>
                                                <Col span={3} className="result-image">
                                                    <Image
                                                        src={
                                                            item.mainImage ||
                                                            (item.listImage && item.listImage[0]) ||
                                                            "/placeholder.png"
                                                        }
                                                        alt={item.name}
                                                        preview={false}
                                                    />
                                                </Col>
                                                <Col span={15} className="result-info">
                                                    <div className="product-name">{item.name}</div>
                                                    <div className="product-id">
                                                        Mã: {item.barcode || item._id}
                                                    </div>
                                                    <div className="product-inventory">
                                                        Tồn: {item.stock || 0}
                                                    </div>
                                                </Col>
                                                <Col span={6} className="result-price">
                                                    {formatPrice(item.sellPrice || 0)}
                                                </Col>
                                            </Row>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                debouncedSearchTerm.trim() !== "" && (
                                    <div className="no-results">
                                        Không tìm thấy sản phẩm phù hợp
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </Col>
            <Col span={13} className="bill-tag">
                <div className="custom-tabs-container">
                    {showNavigationArrows && (
                        <Button
                            type="text"
                            icon={<LeftOutlined />}
                            onClick={showPrevTabs}
                            disabled={startIndex === 0}
                            className="tab-nav-button"
                        />
                    )}

                    <div className="custom-tabs" ref={tabsContainerRef}>
                        <div className="custom-tabs-nav">
                            {bills
                                .slice(startIndex, startIndex + maxVisibleTabs)
                                .map((bill) => (
                                    <div
                                        key={bill.id}
                                        className={`custom-tab ${activeBillId === bill.id.toString() ? "active" : ""
                                            }`}
                                        onClick={() => handleTabChange(bill.id.toString())}
                                    >
                                        <span className="custom-tab-content">{bill.title}</span>
                                        <CloseOutlined
                                            className="tab-close-button"
                                            onClick={(e) => handleCloseTab(e, bill.id.toString())}
                                        />
                                    </div>
                                ))}

                            <div className="custom-tabs-buttons">
                                <Button
                                    type="text"
                                    icon={<PlusOutlined />}
                                    onClick={addNewBill}
                                    className="add-bill-button"
                                    disabled={bills.length >= 20}
                                />
                            </div>
                            <div>
                                {showNavigationArrows && (
                                    <Button
                                        type="text"
                                        icon={<RightOutlined />}
                                        onClick={showNextTabs}
                                        disabled={startIndex >= bills.length - maxVisibleTabs}
                                        className="tab-nav-button"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="custom-tabs-content">
                            {/* The content of the active tab would go here */}
                        </div>
                    </div>
                </div>
            </Col>
            <Col span={5} className="sales-function-container">
                <div className="user-menu-icons">
                    <Button type="text" icon={<UserOutlined />} className="user-icon">
                        Admin
                    </Button>
                    <Button type="text" icon={<MenuOutlined />} className="menu-icon" />
                </div>
            </Col>
        </Row>
    );
};

export default SalesHeader;
