export interface ResultsProps {
    title: string;
    value: string | number;
    subValue?: string | number;
    titleSubValue?: string;
    extraInfo?: string;
    icon?: React.ReactNode;
}

export default ResultsProps;