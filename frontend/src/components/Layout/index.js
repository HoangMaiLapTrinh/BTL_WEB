import React from 'react';
import Header from './component/Header/index.js';
import Footer from './component/Footer/index.js';

function DefaultLayout({ children }) {
    return (
        <div className="wrapper">
            <Header />
            <div className="container">{children}</div>
            <Footer />
        </div>
    );
}
export default DefaultLayout;