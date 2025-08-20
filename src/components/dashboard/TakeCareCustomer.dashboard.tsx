
import zaloImage from "../../assets/zaloDat.jpg"
import { Row } from 'antd'
const TakeCareCustomerDashboard = () => {
    return (
        <div >
            <Row className="take-care-customer-dashboard">
                <div className="title">
                    Liên Hệ Hỗ Trợ
                    Zalo: 0977844114
                    Nguyễn Tiến Đạt
                </div>
                <img
                    className="zaloQR"
                    src={zaloImage}
                    alt="Take Care Customer"
                />

            </Row>



        </div>
    )
}

export default TakeCareCustomerDashboard