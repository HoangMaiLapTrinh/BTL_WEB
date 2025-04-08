import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to the Home page!</p>
            <nav>
                <Link to="/products">Go to Products</Link> | 
                <Link to="/cart">Go to Cart</Link>
            </nav>
        </div>
    );
}
export default Home;