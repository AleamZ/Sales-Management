import { useEffect, useState } from "react";
import SalesHeader from "./components/SalesHeader";
import ModalVariable from "./components/ModalVariable";
import { useGetSerials, useGetVariables } from "@/hooks/useProduct";
import { IProduct, IVariable } from "./types/product.interface";
import ModalSerial from "./components/ModalSerial";
import { v4 as uuidv4 } from "uuid";
import CartProduct from "./components/CartProduct";
import { Product } from "@/enums/product.enum";
import { Col, Row } from "antd";
import PaymentLayout from "./components/Payment";
import { calculateRealSellPrice } from "./utils/calculate";
const SalesPage = () => {
  const [selectedProduct, setSelectedProduct] =
    useState<Partial<IProduct> | null>(null);
  const [selectedVariable, setSelectedVariable] =
    useState<Partial<IVariable> | null>(null);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [cartProductId, setCartProductId] = useState<string>();
  const [cartProducts, setCartsProduct] = useState<any[]>([]);
  console.log({ cartProducts });
  const [isOpenModalVariable, setIsOpenModalVariable] =
    useState<boolean>(false);
  const [isOpenModalSerial, setIsOpenModalSerial] = useState<boolean>(false);
  const { data: variablesData, refetch: refetchVariable } = useGetVariables(
    selectedProduct?._id
  );
  const { data: serialsData } = useGetSerials({
    productId: selectedProduct?._id,
    variableId: selectedVariable?._id,
  });

  const calculateTotal = () => {
    return cartProducts.reduce((total, product) => {
      const price =
        product?.realSellPrice ??
        product?.variable?.sellPrice ??
        product?.sellPrice ??
        0;
      const quantity = product?.quantity ?? 1;
      return total + price * quantity;
    }, 0);
  };
  const handleCloseModalVariable = () => {
    setIsOpenModalVariable(false);
  };

  const handleChooseProduct = (data: IProduct) => {
    setSelectedProduct(data);
    const hasSerials = data.serials && data.serials.length > 0;
    const hasVariables = data.variables && data.variables.length > 0;
    if (hasSerials) {
      setIsOpenModalSerial(true);
      return;
    }

    if (hasVariables) {
      setIsOpenModalVariable(true);
      return;
    }
    const cartItem = {
      typeProduct: Product.NO_VARIABLE_NO_SERIAL,
      cartProductId: uuidv4(),
      productId: data._id,
      barcode: data.barcode,
      brandId: data.brandId,
      categoryId: data.categoryId,
      name: data.name,
      sellPrice: data.sellPrice,
      quantity: 1,
    };
    setCartsProduct((prev) => [...prev, cartItem]);
  };

  const handleChooseVariable = (data: IVariable) => {
    setSelectedVariable(data);
    if (!data.serials.length) {
      const cartItem = {
        typeProduct: Product.NORMAL_VARIABLES,
        cartProductId: uuidv4(),
        productId: selectedProduct?._id,
        barcode: selectedProduct?.barcode,
        brandId: selectedProduct?.brandId,
        categoryId: selectedProduct?.categoryId,
        name: selectedProduct?.name,
        quantity: 1,
        variable: {
          attribute: data?.attribute,
          variableId: data._id,
          serials: [],
          sellPrice: data.sellPrice,
        },
      };
      setCartsProduct((prev) => [...prev, cartItem]);
      setIsOpenModalVariable(false);
    } else {
      setIsOpenModalSerial(true);
      setIsOpenModalVariable(false);
    }
  };

  const updateCartProductQuantity = (cartProductId: string, value: number) => {
    setCartsProduct((prev) =>
      prev.map((item) =>
        item.cartProductId === cartProductId
          ? { ...item, quantity: value }
          : item
      )
    );
  };

  const updateCartProductDiscount = (
    cartProductId: string,
    discountType: "money" | "percent",
    discountValue: number
  ) => {
    setCartsProduct((prev) =>
      prev.map((item) => {
        if (item.cartProductId === cartProductId) {
          // Giá gốc để tính
          const basePrice =
            item.typeProduct === 300 || item.typeProduct === 400
              ? item.variable?.sellPrice ?? 0
              : item.sellPrice ?? 0;

          const newRealSellPrice = calculateRealSellPrice(
            basePrice,
            discountType,
            discountValue
          );

          if (item.typeProduct === 300 || item.typeProduct === 400) {
            // Cập nhật realSellPrice trong variable
            return {
              ...item,
              variable: {
                ...item.variable,
                realSellPrice: newRealSellPrice,
              },
              // Nếu muốn đồng bộ luôn ngoài cùng thì cũng cập nhật ở đây
              realSellPrice: newRealSellPrice,
            };
          } else {
            // Cập nhật realSellPrice ở ngoài
            return {
              ...item,
              realSellPrice: newRealSellPrice,
            };
          }
        }
        return item;
      })
    );
  };
  const handleCloseModalSerial = () => {
    setIsOpenModalSerial(false);
  };

  const handleChooseMoreSerial = (data: any) => {
    setIsOpenModalSerial(true);
    setCartProductId(data.cartProductId);
    setSelectedProduct((prev) => ({ ...prev, _id: data.productId }));
    setSelectedVariable({ _id: data.variable?.variableId });
  };

  const handleConfirm = () => {
    //TH trùng sản phẩm mà add thêm serial
    setCartsProduct((prev) => {
      const existedIndex = prev.findIndex(
        (item) => item.cartProductId === cartProductId
      );

      if (existedIndex !== -1) {
        const newCart = [...prev];
        const updatedProduct = { ...newCart[existedIndex] };
        updatedProduct.variable = {
          ...updatedProduct.variable,
          serials: selectedSerials,
        };
        newCart[existedIndex] = updatedProduct;

        return newCart;
      }
      return [
        ...prev,
        //TH1: Sản phẩm có biến thể vả trong biến thể có serial and //Th2: Sản phẩm không có biến thể mà có serials
        {
          typeProduct: variablesData?.length
            ? Product.NORMAL_VARIABLES_SERIALS
            : Product.NORMAL_SERIALS,
          cartProductId: uuidv4(),
          productId: selectedProduct?._id,
          barcode: selectedProduct?.barcode,
          brandId: selectedProduct?.brandId,
          categoryId: selectedProduct?.categoryId,
          name: selectedProduct?.name,
          sellPrice: variablesData?.length
            ? undefined
            : selectedProduct?.sellPrice,
          serials: variablesData?.length ? undefined : selectedSerials,
          variable: variablesData?.length
            ? {
                attribute: selectedVariable?.attribute,
                variableId: selectedVariable?._id,
                serials: selectedSerials,
                sellPrice: selectedVariable?.sellPrice,
              }
            : undefined,
        },
      ];
    });

    setIsOpenModalSerial(false);
    setIsOpenModalVariable(false);
    setSelectedProduct(null);
    setSelectedVariable(null);
    setSelectedSerials([]);
  };

  const handleRemoveProduct = (cartProductId: string) => {
    setCartsProduct((prev) =>
      prev.filter((p) => p.cartProductId !== cartProductId)
    );
  };

  useEffect(() => {
    if (selectedProduct?._id) {
      refetchVariable();
    }
  }, [selectedProduct?._id]);
  return (
    <div style={{ overflow: "hidden" }}>
      <SalesHeader setSelectedProduct={handleChooseProduct} />
      <Row gutter={[12, 0]} style={{ padding: 12 }}>
        <Col span={18}>
          {cartProducts?.map((item) => (
            <CartProduct
              product={item}
              onRemove={handleRemoveProduct}
              onChooseSerial={handleChooseMoreSerial}
              updateCartProductQuantity={updateCartProductQuantity}
              updateCartProductDiscount={updateCartProductDiscount}
            />
          ))}
        </Col>
        <Col span={6}>
          <PaymentLayout
            totalAmount={calculateTotal()}
            listProducts={cartProducts}
            setCartsProduct={setCartsProduct}
          />
        </Col>
      </Row>

      <ModalVariable
        onClickVariable={handleChooseVariable}
        isOpen={isOpenModalVariable}
        handleClose={handleCloseModalVariable}
        variables={variablesData ?? []}
      />
      <ModalSerial
        isOpen={isOpenModalSerial}
        handleClose={handleCloseModalSerial}
        handleCancel={handleCloseModalSerial}
        handleOk={handleConfirm}
        serials={serialsData ?? []}
        onChangeSerials={(values) => setSelectedSerials(values)}
      />
    </div>
  );
};

export default SalesPage;
