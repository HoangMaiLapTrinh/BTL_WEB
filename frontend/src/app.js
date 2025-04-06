import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/index.js';
import Product from './pages/Product/index.js';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Product />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;
