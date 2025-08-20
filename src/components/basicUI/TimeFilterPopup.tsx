import React, { useState, useEffect } from "react";
import { Button, Popover, Row, Col, List } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import "../../styles/basicUI/timeFilterPopup.scss";

export interface TimeRange {
  key: string;
  label: string;
  type: "day" | "month" | "year";
  value: string;
}

interface TimeFilterPopupProps {
  onChange: (value: string) => void;
  defaultValue?: TimeRange;
  value?: TimeRange;
}

const TimeFilterPopup: React.FC<TimeFilterPopupProps> = ({
  onChange,
  defaultValue,
  value,
}) => {
  const [visible, setVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange | undefined>(
    value || defaultValue
  );

  useEffect(() => {
    if (value) {
      setSelectedRange(value);
    }
  }, [value]);

  const dayRanges: TimeRange[] = [
    {
      key: "today",
      label: "Hôm nay",
      type: "day",
      value: "today",
    },
    {
      key: "yesterday",
      label: "Hôm qua",
      type: "day",
      value: "yesterday",
    },
    {
      key: "thisWeek",
      label: "Tuần này",
      type: "day",
      value: "this_week",
    },
    {
      key: "lastWeek",
      label: "Tuần trước",
      type: "day",
      value: "last_week",
    },
  ];

  const monthRanges: TimeRange[] = [
    {
      key: "thisMonth",
      label: "Tháng này",
      type: "month",
      value: "this_month",
    },
    {
      key: "lastMonth",
      label: "Tháng trước",
      type: "month",
      value: "last_month",
    },
    {
      key: "last3Months",
      label: "3 tháng gần đây",
      type: "month",
      value: "last_3_months",
    },
    {
      key: "last6Months",
      label: "6 tháng gần đây",
      type: "month",
      value: "last_6_months",
    },
  ];

  const yearRanges: TimeRange[] = [
    {
      key: "thisYear",
      label: "Năm nay",
      type: "year",
      value: "this_year",
    },
    {
      key: "lastYear",
      label: "Năm trước",
      type: "year",
      value: "last_year",
    },
    {
      key: "all",
      label: "Tất cả thời gian",
      type: "year",
      value: "all",
    },
  ];

  const handleRangeSelect = (range: TimeRange) => {
    setSelectedRange(range);
    if (onChange) {
      onChange(range.value);
    }
    setVisible(false);
  };

  const content = (
    <div className="time-filter-popup-content">
      <Row gutter={16}>
        <Col span={8}>
          <div className="time-filter-column">
            <h4>Theo Ngày</h4>
            <List
              dataSource={dayRanges}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleRangeSelect(item)}
                  className={selectedRange?.key === item.key ? "selected" : ""}
                >
                  {item.label}
                </List.Item>
              )}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="time-filter-column">
            <h4>Theo Tháng</h4>
            <List
              dataSource={monthRanges}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleRangeSelect(item)}
                  className={selectedRange?.key === item.key ? "selected" : ""}
                >
                  {item.label}
                </List.Item>
              )}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="time-filter-column">
            <h4>Theo Năm</h4>
            <List
              dataSource={yearRanges}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleRangeSelect(item)}
                  className={selectedRange?.key === item.key ? "selected" : ""}
                >
                  {item.label}
                </List.Item>
              )}
            />
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="time-filter-popup">
      <Popover
        content={content}
        title="Chọn khoảng thời gian"
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        placement="bottomLeft"
        overlayClassName="time-filter-popup-overlay"
      >
        <Button icon={<CalendarOutlined />} className="time-filter-button">
          {selectedRange ? (
            <span className="selected-range">{selectedRange.label}</span>
          ) : (
            "Chọn thời gian"
          )}
        </Button>
      </Popover>
    </div>
  );
};

export default TimeFilterPopup;
