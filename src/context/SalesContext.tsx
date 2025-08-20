import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the shape of our context
interface SalesContextType {
    activeBillId: string;
    setActiveBillId: (id: string) => void;
}

// Create the context with a default value
const SalesContext = createContext<SalesContextType>({
    activeBillId: '1',
    setActiveBillId: () => { },
});

// Create a provider component
interface SalesProviderProps {
    children: ReactNode;
}

export const SalesProvider: React.FC<SalesProviderProps> = ({ children }) => {
    const [activeBillId, setActiveBillId] = useState<string>('1');

    return (
        <SalesContext.Provider value={{ activeBillId, setActiveBillId }}>
            {children}
        </SalesContext.Provider>
    );
};

// Custom hook to use the sales context
export const useSalesContext = () => useContext(SalesContext);

export default SalesContext;
