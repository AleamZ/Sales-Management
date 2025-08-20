import { Col, Image, Modal, Row, Typography } from "antd";
import { IVariable } from "../../types/product.interface";

interface ModalVariableProps {
  isOpen: boolean;
  handleClose: () => void;
  variables?: IVariable[];
  onClickVariable: (data: IVariable) => void;
}
const { Text } = Typography;
const ModalVariable = ({
  isOpen,
  handleClose,
  variables,
  onClickVariable,
}: ModalVariableProps) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      onCancel={handleClose}
      title="Chọn biến thể sản phẩm"
      footer={<></>}
    >
      {variables?.map((item) => (
        <Row
          align="middle"
          style={{
            cursor: "pointer",
            padding: "12px",
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            maxWidth: 600,
            marginBottom: 12,
          }}
          onClick={() => onClickVariable(item)}
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
            {item.attribute.map((att) => (
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
                {att.key}: {att.value}
              </Text>
            ))}

            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tồn: {item.stock} | KH đặt: 0
            </Text>
          </Col>

          <Col>
            <Text strong style={{ fontSize: 16, color: "#2d3b59" }}>
              {item.sellPrice?.toLocaleString()} Đ
            </Text>
          </Col>
        </Row>
      ))}
    </Modal>
  );
};

export default ModalVariable;
