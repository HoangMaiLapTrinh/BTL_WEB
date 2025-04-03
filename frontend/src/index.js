import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <div>
            <h1>Hello, world!</h1>
        </div>
    );
}

// Sử dụng createRoot() thay vì render()
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
