import { Button, InputNumber, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

interface CartProductProps {
  product: any;
  onRemove: (cartProductId: string) => void;
  onChooseSerial: (product: any) => void;
  updateCartProductQuantity: (id: string, value: number) => void;
  updateCartProductDiscount: (
    cartProductId: string,
    discountType: "money" | "percent",
    discountValue: number
  ) => void;
}
type TypeDiscountProduct = "money" | "percent";

const CartProduct = ({
  product,
  onRemove,
  onChooseSerial,
  updateCartProductQuantity,
  updateCartProductDiscount,
}: CartProductProps) => {
  const [discountProduct, setDiscountProduct] = useState<number>(0);
  const [typeDiscountProduct, setTypeDiscountProduct] =
    useState<TypeDiscountProduct>("money");

  const getSerials = (product: any) => {
    return product?.variable?.serials || product?.serials || [];
  };

  const getSellPrice = (product: any) => {
    return product?.variable?.sellPrice || product?.sellPrice || 0;
  };

  const quantity =
    getSerials(product).length > 0
      ? getSerials(product).length
      : product.quantity;

  const isSerialMode = getSerials(product).length > 0;

  const calculateDiscountedTotal = (price: number, quantity: number) => {
    const originalTotal = price * quantity;
    let discount = 0;

    if (typeDiscountProduct === "money") {
      discount = discountProduct;
    } else {
      discount = (originalTotal * discountProduct) / 100;
    }

    const finalTotal = originalTotal - discount;
    return finalTotal > 0 ? finalTotal : 0;
  };

  return (
    <div className="product-item">
      <img
        src={product.image || "/no-image.jpg"}
        alt="product"
        className="product-img"
      />
      <div className="product-info">
        <div className="product-title">
          <span>{product.name}</span>{" "}
          {product.variable?.attribute?.length > 0 &&
            product.variable.attribute.map(
              (att: { key: string; value: string }, index: number) => (
                <div key={index}>
                  - <strong>{att.key}: </strong> <strong>{att.value}</strong>
                </div>
              )
            )}
        </div>
        <div className="product-code">Mã: {product.barcode}</div>

        {isSerialMode && (
          <div className="product-serial">
            <Tag color="red">{getSerials(product).length}</Tag>
            <Button
              size="small"
              type="link"
              onClick={() => onChooseSerial(product)}
            >
              Chọn Serial
            </Button>
            {getSerials(product).map((serial: string[], index: number) => (
              <Tag key={index}>{serial}</Tag>
            ))}
          </div>
        )}
      </div>

      <div className="product-price">
        <div>
          {calculateDiscountedTotal(
            getSellPrice(product),
            quantity
          ).toLocaleString()}{" "}
          đ
        </div>
        <div style={{ fontSize: 12, color: "gray" }}>
          {typeDiscountProduct === "money"
            ? `Giảm: ${discountProduct.toLocaleString()} đ`
            : `Giảm: ${discountProduct}%`}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <InputNumber
            placeholder="Chiết khấu"
            value={discountProduct}
            style={{ width: 80, margin: "4px 0" }}
            onChange={(value) => {
              const newDiscount = value ?? 0;
              setDiscountProduct(newDiscount);
              updateCartProductDiscount(
                product.cartProductId,
                typeDiscountProduct,
                newDiscount
              );
            }}
          />
          <Button
            onClick={() =>
              setTypeDiscountProduct(
                typeDiscountProduct === "money" ? "percent" : "money"
              )
            }
          >
            {typeDiscountProduct === "money"
              ? "Chuyển giảm %"
              : "Chuyển giảm tiền"}
          </Button>
        </div>
        <InputNumber
          value={quantity}
          disabled={isSerialMode}
          min={1}
          style={{ width: 60 }}
          onChange={(value) => {
            updateCartProductQuantity(product.cartProductId, value);
          }}
        />
      </div>

      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => onRemove(product.cartProductId)}
      />
    </div>
  );
};

export default CartProduct;
