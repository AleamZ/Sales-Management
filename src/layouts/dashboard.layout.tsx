import { Outlet } from 'react-router-dom'
import { Layout, Row, Col } from 'antd'
import Header from '../components/header/header'

const { Content } = Layout

const dashboardLayout = () => {
    return (
        <Layout className="dashboard-layout">
            <Header />
            <Content className="dashboard-content ">
                <Row className="dashboard-row " gutter={[20, 20]}>
                    {/* <Col span={24} className='isMobile-dashboard-main-content isMobile'>
                        <Outlet />
                    </Col> */}
                    <Col span={2} className="dashboard-gutter-left isDesktop"></Col>
                    <Col span={20} className="dashboard-main-content isDesktop">
                        <Outlet />
                    </Col>
                    <Col span={2} className="dashboard-gutter-right isDesktop"></Col>
                </Row>
            </Content>
        </Layout>
    )
}

export default dashboardLayout