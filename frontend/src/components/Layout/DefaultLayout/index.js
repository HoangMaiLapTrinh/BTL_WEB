import React from 'react';

import Header from './Header/index.js';
import Footer from './Footer/index.js';

function DefaultLayout({ children }) {
    return (
        <div className="default-layout">
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

export default DefaultLayout;
