import { Checkbox, Col, Modal } from "antd";

interface ModalSerialProps {
  isOpen: boolean;
  handleClose: () => void;
  serials: string[];
  onChangeSerials: (values: string[]) => void;
  handleCancel: () => void;
  handleOk: () => void;
}
const ModalSerial = ({
  isOpen,
  handleClose,
  serials,
  onChangeSerials,
  handleCancel,
  handleOk,
}: ModalSerialProps) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      onCancel={handleCancel}
      onOk={handleOk}
      title="Chọn serial"
      okText="Xác nhận"
      cancelText="Hủy bỏ"
    >
      <Checkbox.Group
        style={{ width: "100%" }}
        onChange={(values) => onChangeSerials(values)}
      >
        {serials.map((serial) => (
          <Col span={8}>
            <Checkbox value={serial}>{serial}</Checkbox>
          </Col>
        ))}
      </Checkbox.Group>
    </Modal>
  );
};

export default ModalSerial;
