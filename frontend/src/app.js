import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes/index.js';
import DefaultLayout from './components/Layout/index.js';
import { AuthProvider } from './context/AuthContext.js';
import Header from './components/Layout/component/Header/index.js';
import LoginAndRegister from './pages/LoginandRegister/index.js';
import Toast from './components/Toast/index.js';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Toast />
                    <Header />
                    <Routes>
                        <Route path="/login" element={<LoginAndRegister />} />
                        {publicRoutes.map((route, index) => {
                            const Layout = route.layout === null ? Fragment : DefaultLayout;
                            const Page = route.component;
                            return <Route key={index} path={route.path} element={<Layout><Page /></Layout>} />;
                        })}
                        
                        {privateRoutes.map((route, index) => {
                            const Layout = route.layout === null ? Fragment : DefaultLayout;
                            const Page = route.component;
                            return <Route key={index} path={route.path} element={<Layout><Page /></Layout>} />;
                        })}
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
