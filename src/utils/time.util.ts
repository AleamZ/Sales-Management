export const convertHour = (hour: string) => {
    console.log({hour})
  const today = new Date();
  const [h, m] = hour.split(":");
  today.setHours(Number(h), Number(m), 0, 0);
  return today.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const convertDay = (day: string) => {
  const date = new Date();
  date.setDate(Number(day));
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};
