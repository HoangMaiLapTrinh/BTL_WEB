import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../src/app.js';
import GlobalStyles from './components/GlobalStyles/index.js';
import './components/GlobalStyles/GlobalStyles.scss';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <GlobalStyles>
            <App />
        </GlobalStyles>
    </React.StrictMode>
);
