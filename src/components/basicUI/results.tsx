import React from 'react';
import { Card } from 'antd';
import { ResultsProps } from '../../interface/resultsProps.interface';
import '../../styles/components/results.scss';

const Results: React.FC<ResultsProps> = ({ title, value, subValue, titleSubValue, extraInfo, icon }) => {
    return (
        <Card className="results-container">
            <div className="results-header">
                {icon && <div className="icon">{icon}</div>}
                <div className="m-title">{title}</div>
            </div>
            <div className="value">{value}</div>
            {subValue && (
                <div className="sub-value">
                    {titleSubValue && <span className="sub-title">{titleSubValue}: </span>}
                    {subValue}
                </div>
            )}
            {extraInfo && (
                <div className="extra-info" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {extraInfo}
                </div>
            )}
        </Card>
    );
};

export default Results;