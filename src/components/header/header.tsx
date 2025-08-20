import React from 'react';
import MMenu from '../menu/mMenu';
import TopMenu from '../menu/topMenu';

const Header: React.FC = () => {
    return (
        <>
            <div className='isDesktop'>
                <TopMenu />

            </div>
            <MMenu />
        </>
    );
};

export default Header;