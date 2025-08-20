import { useDebounce } from "@/hooks/useDebounce";
import { useProductsQuery } from "@/hooks/useProduct";
import { Button, Col, Image, Input, Row, Typography } from "antd";
import { useState } from "react";
import { IProduct } from "../../types/product.interface";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;

interface SalesHeaderProps {
  setSelectedProduct: (product: IProduct) => void;
}

const SalesHeader = ({ setSelectedProduct }: SalesHeaderProps) => {
  const [search, setSearch] = useState<string>("");
  const valueSearch = useDebounce(search, 500);
  const { data } = useProductsQuery(valueSearch);
  const navigate = useNavigate();
  return (
    <Row
      className="sales-header"
      gutter={[0, 0]}
      style={{ display: "flex", alignItems: "center", padding: "0 12px" }}
    >
      <Col span={6} className="search-container">
        <div className="search-wrapper">
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            size="large"
            className="sales-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <div
            style={{
              position: "absolute",
              top: 45,
              background: "#fff",
              width: "96%",
              borderRadius: 4,
              paddingBottom: 12,
              paddingLeft: 6,
              paddingRight: 6,
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              overflowY: "auto",
              height: "500px",
            }}
          >
            <header>
              <Typography.Title level={5}>
                Sản phẩm tìm kiếm được
              </Typography.Title>
            </header>
            {data?.products.map((item) => (
              <Row
                align="middle"
                style={{
                  cursor: "pointer",
                  padding: "12px",
                  border: "1px solid black",
                  borderRadius: 8,
                  maxWidth: 600,
                  marginBottom: 12,
                }}
                onClick={() => {
                  setSelectedProduct(item as IProduct);
                  setSearch("");
                }}
              >
                <Col>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 16,
                    }}
                  >
                    <Image
                      src="https://via.placeholder.com/32"
                      preview={false}
                      width={32}
                      height={32}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </Col>

                <Col flex="auto">
                  <Text
                    strong
                    style={{
                      display: "inline-block",
                      maxWidth: 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </Text>

                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Tồn: {item.stock}
                  </Text>
                </Col>

                <Col>
                  <Text strong style={{ fontSize: 16, color: "#2d3b59" }}>
                    {item.sellPrice?.toLocaleString()} Đ
                  </Text>
                </Col>
              </Row>
            ))}
          </div>
        )}
      </Col>
      <Col
        span={18}
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={() => navigate("/")}>Về trang chủ</Button>
      </Col>
    </Row>
  );
};

export default SalesHeader;
