import React, { useRef, useState } from 'react';
import { Modal, Button, Space, Row, Col, Typography, Divider, InputNumber } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import Barcode from 'react-barcode';

const { Title, Text } = Typography;

interface BarcodeModalProps {
    visible: boolean;
    onClose: () => void;
    productData: {
        barcode?: string;
        name?: string;
        sellPrice?: number;
        _id?: string;
    };
    copies?: number;
}

const BarcodeModal: React.FC<BarcodeModalProps> = ({
    visible,
    onClose,
    productData,
    copies = 1, // default value
}) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [printCopies, setPrintCopies] = useState(copies);

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow && printRef.current) {
            // Write print content to the new window
            printWindow.document.write(`
        <html>
          <head>
            <title>In mã vạch - ${productData.name || 'Sản phẩm'}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .barcode-container {
                width: 300px;
                padding: 10px;
                margin: 10px;
                page-break-inside: avoid;
                border: 1px dashed #ccc;
                display: inline-block;
              }
              .barcode-name {
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 5px;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .barcode-price {
                font-size: 16px;
                font-weight: bold;
                text-align: center;
              }
              .barcode-wrapper {
                display: flex;
                justify-content: center;
              }
            </style>
          </head>
          <body>
      `);

            // Generate multiple copies if needed
            for (let i = 0; i < printCopies; i++) {
                printWindow.document.write(`
          <div class="barcode-container">
            <div class="barcode-name">${productData.name || 'Sản phẩm'}</div>
            <div class="barcode-wrapper">
              ${printRef.current.innerHTML}
            </div>
            <div class="barcode-price">
              ${productData.sellPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Chưa có giá'}
            </div>
          </div>
        `);
            }

            printWindow.document.write(`
          </body>
        </html>
      `);

            // Trigger print once everything is loaded
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.focus();
                printWindow.print();
                // Optional: close after print
                // printWindow.close();
            };
        }
    };

    return (
        <Modal
            title="In mã vạch sản phẩm"
            open={visible}
            onCancel={onClose}
            width={400}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
                <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                    In mã vạch
                </Button>
            ]}
        >
            <Divider />
            <Row gutter={[0, 16]}>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Title level={5}>{productData.name}</Title>
                </Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <div ref={printRef}>
                        <Barcode
                            value={productData.barcode || productData._id?.toString() || '0000000000'}
                            width={2}
                            height={50}
                            fontSize={14}
                            margin={10}
                            displayValue={true}
                        />
                    </div>
                </Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Text strong>
                        Giá bán: {productData.sellPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Chưa có giá'}
                    </Text>
                </Col>
                <Col span={24} style={{ marginTop: 16 }}>
                    <Space align="center" style={{ width: '100%', justifyContent: 'center' }}>
                        <Text>Số lượng:</Text>
                        <InputNumber
                            min={1}
                            max={100}
                            defaultValue={printCopies}
                            onChange={value => setPrintCopies(value || 1)}
                        />
                    </Space>
                </Col>
            </Row>
            <Divider />
        </Modal>
    );
};

export default BarcodeModal;
