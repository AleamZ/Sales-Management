import type { AxiosAdapter, AxiosResponse } from "axios";
import productsJson from "../fakeData/products.json";
import brandsJson from "../fakeData/brands.json";
import categoriesJson from "../fakeData/categorys.json";
import doanhThuNgay from "../fakeData/DoanhThuNgay.json";
import doanhThuHomQua from "../fakeData/DoanhThuHomQua.json";
import doanhThuThang from "../fakeData/DoanhThuThang.json";
import top10SanPham from "../fakeData/Top10SanPham.json";

type AnyRecord = Record<string, any>;

const toAxiosResponse = (config: any, data: any, status = 200): AxiosResponse<any> => ({
    data,
    status,
    statusText: status === 200 ? "OK" : "ERROR",
    headers: {},
    config,
} as AxiosResponse<any>);

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

const normalizeProducts = () => {
    const list = (productsJson as any[]).map((p, idx) => {
        const serials = Array.isArray(p.serial)
            ? p.serial.map((s: any) => s.serialNumber)
            : [];
        return {
            _id: p.productId || String(idx + 1),
            productId: p.productId,
            barcode: p.productId,
            name: p.productName,
            costPrice: p.costPrice,
            sellPrice: p.sellingPrice,
            stock: p.inventory,
            description: p.description,
            brandId: p.brandId,
            categoryId: p.categoryId,
            mainImage: Array.isArray(p.imageUrl) ? p.imageUrl[0] : undefined,
            listImage: Array.isArray(p.imageUrl) ? p.imageUrl : [],
            isVariable: false,
            variables: [],
            isSerial: !!p.isSerial,
            serials,
            createdAt: p.createdAt,
            updatedAt: p.createdAt,
            isDelete: false,
        };
    });
    return list;
};

const paginate = <T,>(items: T[], page = 1, limit = 10) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return items.slice(start, end);
};

const toChart = (arr: any[]) => arr.map((i) => ({ date: i.date, revenue: i.value, profit: Math.round(i.value * 0.18) }));

const getRevenueTimeType = (type?: string) => {
    switch (type) {
        case "TODAY":
        default:
            return doanhThuNgay?.[0];
        case "YESTERDAY":
            return doanhThuHomQua?.[0];
        case "THIS_MONTH":
        case "LAST_MONTH":
            return doanhThuThang?.[0];
    }
};

const buildYearData = (year?: number) => {
    const monthGroups = Array.from({ length: 12 }, (_, i) => {
        const revenue = 5_000_000 + Math.round(Math.random() * 95_000_000);
        return { date: String(i + 1), revenue, profit: Math.round(revenue * 0.18) };
    });
    const totalRevenue = monthGroups.reduce((s, m) => s + m.revenue, 0);
    const totalProfit = Math.round(totalRevenue * 0.18);
    return { year: year || new Date().getFullYear(), totalRevenue, totalProfit, monthGroups };
};

const buildTopProducts = () => {
    const revenue = (top10SanPham as any[]).map((i) => ({ date: i.productName, value: i.totalRevenue }));
    const quantity = (top10SanPham as any[]).map((i) => ({ date: i.productName, value: i.totalQuantity }));
    return { revenue, quantity };
};

const buildActivityLogs = () => {
    // Create a small set of normalized activity logs
    const now = new Date();
    const users = [
        { _id: "u1", name: "Nguyễn Tiến Đạt" },
        { _id: "u2", name: "Trần Thị B" },
    ];
    return [
        {
            _id: "log1",
            userId: users[0],
            action: "CREATE_ORDER",
            message: "Tạo đơn hàng mới",
            refId: "ORD001",
            refType: "Order",
            metadata: { total: 3500000, productCount: 3 },
            createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        },
        {
            _id: "log2",
            userId: users[1],
            action: "UPDATE_PRODUCT",
            message: "Cập nhật giá bán sản phẩm",
            refId: { _id: "SP001", barcode: "SP001" },
            refType: "Product",
            metadata: { productCount: 1 },
            createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        },
        {
            _id: "log3",
            userId: users[0],
            action: "DELETE_ORDER",
            message: "Xóa hóa đơn sai thông tin",
            refId: "ORD002",
            refType: "Order",
            metadata: { productCount: 2, originalRevenue: 2100000, originalCostPrice: 1500000, totalAmount: 2100000 },
            createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
        },
    ];
};

export const createMockAdapter = (): AxiosAdapter => {
    const productList = normalizeProducts();
    const activityLogs = buildActivityLogs();

    return async (config) => {
        const url = (config.url || "").split("?")[0];
        const method = (config.method || "get").toLowerCase();
        const params: AnyRecord = { ...(config.params || {}) };

        // Small artificial delay
        await delay();

        // PRODUCTS
        if (url === "/products" && method === "get") {
            const page = Number(params.page || 1);
            const limit = Number(params.limit || 10);
            const keyword = (params.keyword || "").toString().toLowerCase();
            const brandId = params.brandId?.toString();
            const categoryId = params.categoryId?.toString();

            let filtered = productList;
            if (keyword) {
                filtered = filtered.filter((p) => (p.name || "").toLowerCase().includes(keyword) || (p.barcode || "").toLowerCase().includes(keyword));
            }
            if (brandId) filtered = filtered.filter((p) => String(p.brandId) === brandId);
            if (categoryId) filtered = filtered.filter((p) => String(p.categoryId) === categoryId);

            const paginated = paginate(filtered, page, limit);
            const payload = {
                statusCode: 200,
                ok: true,
                data: { products: paginated, total: filtered.length },
                message: "Success",
            };
            return toAxiosResponse(config, payload);
        }

        if (url?.startsWith("/products/") && method === "get") {
            const id = url.split("/")[2];
            const found = productList.find((p) => String(p._id) === id || p.barcode === id);
            const payload = { ok: !!found, data: found ?? null, message: found ? "Success" : "Not found" };
            return toAxiosResponse(config, payload, found ? 200 : 404);
        }

        if (url?.startsWith("/products/variables/") && method === "get") {
            return toAxiosResponse(config, { data: [] });
        }

        if (url === "/products/serials" && method === "post") {
            const body = (config.data && typeof config.data === "string") ? JSON.parse(config.data) : (config.data || {});
            const product = productList.find((p) => String(p._id) === String(body.productId));
            return toAxiosResponse(config, { data: product?.serials ?? [] });
        }

        // BRANDS
        if (url === "/brands" && method === "get") {
            const data = (brandsJson as any[]).map((b) => ({ _id: b.id, name: b.name }));
            return toAxiosResponse(config, { data });
        }
        if (url === "/brands" && method === "post") {
            return toAxiosResponse(config, { ok: true, message: "Created" });
        }
        if (url?.startsWith("/brands/") && ["put", "delete"].includes(method)) {
            return toAxiosResponse(config, { ok: true, message: method === "put" ? "Updated" : "Deleted" });
        }

        // CATEGORIES
        if (url === "/categories" && method === "get") {
            const data = (categoriesJson as any[]).map((c) => ({ _id: c.id, name: c.title, parentId: c.parentId }));
            return toAxiosResponse(config, { data });
        }
        if (url?.startsWith("/categories") && ["post", "put", "delete"].includes(method)) {
            return toAxiosResponse(config, { ok: true, message: "OK" });
        }

        // DASHBOARDS
        if (url === "/dashboards/revenue" && method === "get") {
            const value = 10_500_000;
            const payload = {
                data: {
                    value,
                    totalBill: 12,
                    totalOrders: 120,
                    totalNormalOrders: 115,
                    totalReturnedOrders: 5,
                    compareWithYesterday: 12.5,
                    compareActualWithYesterday: 9.2,
                    compareWithMonth: -5.1,
                    compareActualWithMonth: -2.8,
                },
            };
            return toAxiosResponse(config, payload);
        }

        if (url === "/dashboards/dateTime" && method === "get") {
            const type = params.timeType as string | undefined;
            const src = getRevenueTimeType(type);
            const chartDay = toChart(src?.chartDay || []);
            const chartHour = toChart(src?.chartHour || []);
            const chartWeek = toChart(src?.chartWeek || []);
            const totalRevenue = src?.totalRevenue || 0;
            const totalProfit = Math.round(totalRevenue * 0.18);
            return toAxiosResponse(config, { totalRevenue, totalProfit, chartDay, chartHour, chartWeek });
        }

        if (url === "/dashboards/topProduct" && method === "get") {
            const data = buildTopProducts();
            return toAxiosResponse(config, { data });
        }

        if (url === "/dashboards/year" && method === "get") {
            const year = Number((config.params || {}).year) || new Date().getFullYear();
            const data = buildYearData(year);
            return toAxiosResponse(config, data);
        }

        if (url === "/activity-logs" && method === "get") {
            return toAxiosResponse(config, activityLogs);
        }
        if (url?.startsWith("/activity-logs/") && method === "get") {
            const id = url.split("/")[2];
            const found = activityLogs.find((l) => l._id === id) || activityLogs[0];
            return toAxiosResponse(config, found);
        }

        // AUTH/STUBS
        if (url === "/auth/login" && method === "post") {
            // UTF-8 safe Base64URL encoder
            const base64UrlEncode = (obj: any) => {
                const json = JSON.stringify(obj);
                // encodeURIComponent handles UTF-8; unescape makes it Latin1 for btoa
                const utf8 = unescape(encodeURIComponent(json));
                const base64 = btoa(utf8);
                return base64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
            };
            const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
            const payload = base64UrlEncode({
                sub: "u1",
                userId: "u1",
                name: "Nguyễn Tiến Đạt",
                email: "tiendat@gmail.com",
                role: "ADMIN",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
            });
            const token = `${header}.${payload}.signature`;
            return toAxiosResponse(config, { statusCode: 200, ok: true, data: { accessToken: token, refreshToken: "demo-refresh" }, message: "OK" });
        }
        if (url === "/auth/register" && method === "post") {
            return toAxiosResponse(config, { statusCode: 200, ok: true, data: { accessToken: "demo-token" }, message: "OK" });
        }

        // FALLBACK: unhandled -> generic OK
        return toAxiosResponse(config, { ok: true, message: "Mock OK" });
    };
};

export default createMockAdapter;


