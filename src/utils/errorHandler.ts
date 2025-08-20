/* eslint-disable @typescript-eslint/no-explicit-any */
import { message } from 'antd';

// Interface cho error response từ backend (cập nhật để match với backend mới)
interface ErrorResponse {
    statusCode?: number;
    message?: string;
    error?: string;
    errorCode?: string;
    details?: any;
    timestamp?: string;
    path?: string;
    method?: string;
    data?: any; // Để backward compatibility
}

// Mapping các mã lỗi HTTP sang thông báo tiếng Việt
const HTTP_ERROR_MESSAGES: Record<number, string> = {
    400: 'Dữ liệu không hợp lệ',
    401: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn',
    403: 'Bạn không có quyền thực hiện hành động này',
    404: 'Không tìm thấy dữ liệu yêu cầu',
    409: 'Dữ liệu đã tồn tại trong hệ thống',
    422: 'Dữ liệu không đúng định dạng yêu cầu',
    429: 'Bạn đã thực hiện quá nhiều yêu cầu, vui lòng thử lại sau',
    500: 'Lỗi hệ thống, vui lòng thử lại sau',
    502: 'Máy chủ đang bảo trì, vui lòng thử lại sau',
    503: 'Dịch vụ tạm thời không khả dụng',
    504: 'Kết nối mạng chậm, vui lòng thử lại'
};

// Mapping các lỗi cụ thể từ backend
const BACKEND_ERROR_MESSAGES: Record<string, string> = {
    // Product errors
    'PRODUCT_NOT_FOUND': 'Không tìm thấy sản phẩm. Sản phẩm có thể đã bị xóa hoặc không tồn tại.',
    'PRODUCT_ALREADY_EXISTS': 'Sản phẩm với thông tin này đã tồn tại trong hệ thống.',
    'PRODUCT_IN_USE': 'Không thể xóa sản phẩm đang được sử dụng trong đơn hàng hoặc giao dịch.',
    'INVALID_PRODUCT_DATA': 'Thông tin sản phẩm không hợp lệ. Vui lòng kiểm tra lại dữ liệu đã nhập.',
    'INSUFFICIENT_STOCK': 'Số lượng tồn kho không đủ để thực hiện thao tác này.',
    'BARCODE_ALREADY_EXISTS': 'Mã sản phẩm này đã được sử dụng cho sản phẩm khác đang hoạt động.',
    'DUPLICATE_BARCODE': 'Mã sản phẩm đã được sử dụng. Vui lòng chọn mã khác.',

    // Category errors
    'CATEGORY_NOT_FOUND': 'Không tìm thấy danh mục. Danh mục có thể đã bị xóa hoặc không tồn tại.',
    'CATEGORY_ALREADY_EXISTS': 'Danh mục với tên này đã tồn tại trong hệ thống.',
    'CATEGORY_IN_USE': 'Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.',
    'INVALID_CATEGORY_DATA': 'Thông tin danh mục không hợp lệ. Vui lòng kiểm tra tên và mô tả danh mục.',

    // Brand errors
    'BRAND_NOT_FOUND': 'Không tìm thấy thương hiệu. Thương hiệu có thể đã bị xóa hoặc không tồn tại.',
    'BRAND_ALREADY_EXISTS': 'Thương hiệu với tên này đã tồn tại trong hệ thống.',
    'BRAND_IN_USE': 'Không thể xóa thương hiệu đang có sản phẩm. Vui lòng chuyển sản phẩm sang thương hiệu khác trước.',
    'INVALID_BRAND_DATA': 'Thông tin thương hiệu không hợp lệ. Vui lòng kiểm tra tên và mô tả thương hiệu.',

    // Customer errors
    'CUSTOMER_NOT_FOUND': 'Không tìm thấy khách hàng. Khách hàng có thể đã bị xóa hoặc không tồn tại.',
    'CUSTOMER_ALREADY_EXISTS': 'Khách hàng với thông tin này đã tồn tại trong hệ thống.',
    'INVALID_CUSTOMER_DATA': 'Thông tin khách hàng không hợp lệ. Vui lòng kiểm tra lại dữ liệu đã nhập.',
    'DUPLICATE_PHONE': 'Số điện thoại này đã được đăng ký cho khách hàng khác.',
    'DUPLICATE_EMAIL': 'Email này đã được đăng ký cho khách hàng khác.',

    // Order errors
    'ORDER_NOT_FOUND': 'Không tìm thấy đơn hàng. Đơn hàng có thể đã bị xóa hoặc không tồn tại.',
    'ORDER_CANNOT_BE_MODIFIED': 'Đơn hàng đã được xác nhận và không thể chỉnh sửa.',
    'INVALID_ORDER_STATUS': 'Trạng thái đơn hàng không hợp lệ hoặc không thể chuyển đổi.',
    'ORDER_ALREADY_PAID': 'Đơn hàng đã được thanh toán và không thể thay đổi.',

    // Staff errors
    'STAFF_NOT_FOUND': 'Không tìm thấy nhân viên',
    'STAFF_ALREADY_EXISTS': 'Nhân viên đã tồn tại',
    'INVALID_STAFF_DATA': 'Thông tin nhân viên không hợp lệ',

    // Authentication errors
    'INVALID_CREDENTIALS': 'Tên đăng nhập hoặc mật khẩu không đúng',
    'TOKEN_EXPIRED': 'Phiên đăng nhập đã hết hạn',
    'TOKEN_INVALID': 'Phiên đăng nhập không hợp lệ',
    'ACCESS_DENIED': 'Không có quyền truy cập',

    // File upload errors
    'INVALID_FILE_TYPE': 'Định dạng file không được hỗ trợ',
    'FILE_TOO_LARGE': 'Kích thước file quá lớn',
    'UPLOAD_FAILED': 'Tải file lên thất bại',

    // Validation errors
    'REQUIRED_FIELD_MISSING': 'Thiếu thông tin bắt buộc',
    'INVALID_FORMAT': 'Định dạng dữ liệu không đúng',
    'VALUE_TOO_LONG': 'Giá trị quá dài',
    'VALUE_TOO_SHORT': 'Giá trị quá ngắn',
    'INVALID_NUMBER': 'Số không hợp lệ',
    'INVALID_DATE': 'Ngày tháng không hợp lệ',

    // Network errors
    'NETWORK_ERROR': 'Lỗi kết nối mạng',
    'TIMEOUT_ERROR': 'Hết thời gian chờ phản hồi',
    'SERVER_ERROR': 'Lỗi máy chủ',
};

/**
 * Parse MongoDB error messages thành tiếng Việt
 */
const parseMongoDBError = (errorMessage: string): string | null => {
    // MongoDB duplicate key error (E11000)
    if (errorMessage.includes('E11000 duplicate key error')) {
        // Parse field name từ error message
        if (errorMessage.includes('barcode_1_isDelete_1 dup key') || errorMessage.includes('barcode_1 dup key')) {
            const barcodeMatch = errorMessage.match(/barcode: "([^"]+)"/);
            const duplicateBarcode = barcodeMatch ? barcodeMatch[1] : '';
            return `Mã sản phẩm "${duplicateBarcode}" đã được sử dụng cho sản phẩm khác đang hoạt động. Vui lòng sử dụng mã khác hoặc cập nhật sản phẩm hiện có.`;
        }
        // Removed name duplicate check - names can be duplicated now
        if (errorMessage.includes('email_1 dup key')) {
            const emailMatch = errorMessage.match(/email: "([^"]+)"/);
            const duplicateEmail = emailMatch ? emailMatch[1] : '';
            return `Email "${duplicateEmail}" đã được đăng ký cho tài khoản khác. Vui lòng sử dụng email khác.`;
        }
        if (errorMessage.includes('phone_1 dup key')) {
            const phoneMatch = errorMessage.match(/phone: "([^"]+)"/);
            const duplicatePhone = phoneMatch ? phoneMatch[1] : '';
            return `Số điện thoại "${duplicatePhone}" đã được đăng ký cho tài khoản khác. Vui lòng sử dụng số khác.`;
        }
        // Generic duplicate key
        return 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra và nhập thông tin khác.';
    }

    // MongoDB validation errors with specific details
    if (errorMessage.includes('ValidationError')) {
        // Try to extract which field has validation error
        if (errorMessage.includes('name')) {
            return 'Tên sản phẩm không hợp lệ. Vui lòng kiểm tra độ dài và ký tự đặc biệt.';
        }
        if (errorMessage.includes('barcode')) {
            return 'Mã sản phẩm không hợp lệ. Vui lòng kiểm tra định dạng mã sản phẩm.';
        }
        if (errorMessage.includes('email')) {
            return 'Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: example@email.com).';
        }
        if (errorMessage.includes('phone')) {
            return 'Số điện thoại không đúng định dạng. Vui lòng nhập số điện thoại hợp lệ.';
        }
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
    }

    // MongoDB cast errors with more specific details
    if (errorMessage.includes('CastError')) {
        if (errorMessage.includes('ObjectId')) {
            return 'ID không hợp lệ. Vui lòng kiểm tra lại thông tin liên kết.';
        }
        if (errorMessage.includes('Number')) {
            return 'Giá trị số không hợp lệ. Vui lòng nhập số hợp lệ.';
        }
        if (errorMessage.includes('Date')) {
            return 'Ngày tháng không hợp lệ. Vui lòng kiểm tra định dạng ngày.';
        }
        return 'Định dạng dữ liệu không đúng. Vui lòng kiểm tra lại thông tin.';
    }

    return null;
};

/**
 * Parse các lỗi backend khác
 */
const parseBackendError = (errorMessage: string): string | null => {
    // Parse specific barcode errors - ưu tiên message từ backend
    if (errorMessage.includes('đã được sử dụng cho sản phẩm')) {
        return errorMessage; // Sử dụng message chi tiết từ backend
    }

    if (errorMessage.includes('Mã sản phẩm đã tồn tại')) {
        return 'Mã sản phẩm này đã được sử dụng cho sản phẩm khác đang hoạt động. Vui lòng sử dụng mã khác.';
    }

    // Parse MongoDB path validation errors
    if (errorMessage.includes('Path `name` (')) {
        return 'Tên sản phẩm không hợp lệ. Vui lòng kiểm tra lại tên sản phẩm.';
    }

    if (errorMessage.includes('Path `barcode` (')) {
        return 'Mã sản phẩm không hợp lệ. Vui lòng kiểm tra định dạng mã sản phẩm.';
    }

    if (errorMessage.includes('Path `email` (')) {
        return 'Email không đúng định dạng. Vui lòng nhập email hợp lệ.';
    }

    if (errorMessage.includes('Path `phone` (')) {
        return 'Số điện thoại không đúng định dạng. Vui lòng nhập số điện thoại hợp lệ.';
    }

    // Parse specific product validation errors
    if (errorMessage.includes('Variable products are required when isVariable is true')) {
        return 'Sản phẩm có biến thể phải có ít nhất một biến thể. Vui lòng thêm biến thể cho sản phẩm.';
    }

    if (errorMessage.includes('Cost price and sell price are required for each variable')) {
        return 'Giá vốn và giá bán là bắt buộc cho mỗi biến thể sản phẩm.';
    }

    if (errorMessage.includes('Serials are required for variable')) {
        return 'Serial là bắt buộc cho biến thể sản phẩm có quản lý serial.';
    }

    if (errorMessage.includes('Cost Price is required and must be a number')) {
        return 'Giá vốn là bắt buộc và phải là số. Vui lòng nhập giá vốn hợp lệ.';
    }

    if (errorMessage.includes('Sell Price is required and must be a number')) {
        return 'Giá bán là bắt buộc và phải là số. Vui lòng nhập giá bán hợp lệ.';
    }

    if (errorMessage.includes('Stock is required and must be a number')) {
        return 'Số lượng tồn kho là bắt buộc và phải là số. Vui lòng nhập số lượng hợp lệ.';
    }

    if (errorMessage.includes('Serials are required for non-variable product when isSerial is true')) {
        return 'Serial là bắt buộc cho sản phẩm quản lý theo serial. Vui lòng thêm danh sách serial.';
    }

    if (errorMessage.includes('Number of serials') && errorMessage.includes('must match')) {
        return 'Số lượng serial phải bằng với số lượng tồn kho. Vui lòng kiểm tra lại.';
    }

    if (errorMessage.includes('Product with ID') && errorMessage.includes('not found')) {
        return 'Không tìm thấy sản phẩm. Sản phẩm có thể đã bị xóa hoặc không tồn tại.';
    }

    // Parse required field errors
    if (errorMessage.includes('is required')) {
        const fieldMatch = errorMessage.match(/Path `(\w+)`.*is required/);
        const fieldName = fieldMatch ? fieldMatch[1] : 'trường';
        const fieldDisplayNames: Record<string, string> = {
            name: 'tên sản phẩm',
            barcode: 'mã sản phẩm',
            email: 'email',
            phone: 'số điện thoại',
            costPrice: 'giá vốn',
            sellPrice: 'giá bán',
            stock: 'số lượng tồn kho',
            brandId: 'thương hiệu',
            categoryId: 'danh mục',
            price: 'giá'
        };
        const displayName = fieldDisplayNames[fieldName] || fieldName;
        return `Vui lòng nhập ${displayName}`;
    }

    return null;
};

/**
 * Xử lý và hiển thị thông báo lỗi chi tiết bằng tiếng Việt
 * @param error - Error object từ axios hoặc các nguồn khác
 * @param defaultMessage - Thông báo mặc định nếu không xác định được lỗi cụ thể
 */
export const handleErrorMessage = (
    error: any,
    defaultMessage = 'Có lỗi xảy ra, vui lòng thử lại'
): void => {
    console.error('Error details:', error);

    let errorMessage = defaultMessage;

    // Nếu error có response data (từ axios)
    if (error?.response?.data) {
        let errorData: ErrorResponse;

        // Xử lý trường hợp response.data là string hoặc object
        if (typeof error.response.data === 'string') {
            // Parse MongoDB errors từ string
            const mongoError = parseMongoDBError(error.response.data);
            if (mongoError) {
                errorMessage = mongoError;
                message.error(errorMessage);
                return;
            }

            // Parse backend errors từ string
            const backendError = parseBackendError(error.response.data);
            if (backendError) {
                errorMessage = backendError;
                message.error(errorMessage);
                return;
            }

            // Nếu là string nhưng không parse được, tạo object
            errorData = { message: error.response.data };
        } else {
            errorData = error.response.data;
        }

        // Ưu tiên message từ backend (đã được format bởi HttpExceptionFilter)
        if (errorData.message) {
            errorMessage = errorData.message;
        }
        // Fallback: sử dụng errorCode để tìm thông báo chuẩn
        else if (errorData.errorCode && BACKEND_ERROR_MESSAGES[errorData.errorCode]) {
            errorMessage = BACKEND_ERROR_MESSAGES[errorData.errorCode];
        }
        // Fallback based on status code
        else {
            errorMessage = HTTP_ERROR_MESSAGES[errorData.statusCode || error.response?.status] || defaultMessage;
        }


    }
    // Nếu error không có response (network error, etc.)
    else if (error?.message) {
        // Parse MongoDB errors trong raw message
        const mongoError = parseMongoDBError(error.message);
        if (mongoError) {
            errorMessage = mongoError;
        }
        // Parse backend errors trong raw message  
        else {
            const backendError = parseBackendError(error.message);
            if (backendError) {
                errorMessage = backendError;
            }
            // Kiểm tra một số error message phổ biến
            else if (error.message.includes('Network Error') || error.message.includes('network')) {
                errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại sau ít phút.';
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra máy chủ có đang chạy không.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Không tìm thấy tài nguyên yêu cầu. Vui lòng kiểm tra lại đường dẫn.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Bạn không có quyền truy cập tài nguyên này.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            } else if (isVietnamese(error.message)) {
                errorMessage = error.message;
            }
        }
    }
    // Nếu error có statusCode trực tiếp
    else if (error?.statusCode && HTTP_ERROR_MESSAGES[error.statusCode]) {
        errorMessage = HTTP_ERROR_MESSAGES[error.statusCode];
    }

    // Hiển thị thông báo lỗi
    message.error(errorMessage);
};

/**
 * Xử lý thông báo lỗi cho các thao tác CRUD cụ thể
 */
export const handleCRUDError = {
    create: (entity: string, error: any) =>
        handleErrorMessage(error, `Thêm ${entity} thất bại. Vui lòng kiểm tra lại thông tin và thử lại.`),

    update: (entity: string, error: any) =>
        handleErrorMessage(error, `Cập nhật ${entity} thất bại. Vui lòng kiểm tra lại thông tin và thử lại.`),

    delete: (entity: string, error: any) =>
        handleErrorMessage(error, `Xóa ${entity} thất bại. ${entity} có thể đang được sử dụng.`),

    fetch: (entity: string, error: any) =>
        handleErrorMessage(error, `Tải danh sách ${entity} thất bại. Vui lòng kiểm tra kết nối và thử lại.`),

    upload: (error: any) =>
        handleErrorMessage(error, 'Tải file lên thất bại. Vui lòng kiểm tra định dạng file và kích thước.'),
};

/**
 * Kiểm tra xem một chuỗi có chứa ký tự tiếng Việt không
 */
function isVietnamese(text: string): boolean {
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
    return vietnameseRegex.test(text);
}

/**
 * Tạo thông báo warning với context cụ thể
 */
export const showWarningMessage = (
    action: string,
    requirement?: string
): void => {
    const warningMessage = requirement
        ? `${action}: ${requirement}`
        : action;
    message.warning(warningMessage);
};

/**
 * Tạo thông báo success với context cụ thể
 */
export const showSuccessMessage = (
    action: string,
    entity?: string
): void => {
    const successMessage = entity
        ? `${action} ${entity} thành công`
        : `${action} thành công`;
    message.success(successMessage);
}; 