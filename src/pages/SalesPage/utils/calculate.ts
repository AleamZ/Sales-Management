export const calculateRealSellPrice = (
  sellPrice: number,
  discountType: "money" | "percent",
  discountValue: number
): number => {
  if (discountType === "money") {
    return Math.max(0, sellPrice - discountValue);
  }

  if (discountType === "percent") {
    return Math.max(0, sellPrice - (sellPrice * discountValue) / 100);
  }

  return sellPrice;
};

export const formatNumber = (value: number | string) => {
  const number = Number(String(value).replace(/,/g, ""));
  if (isNaN(number)) return "";
  return number.toLocaleString("en-US");
};
