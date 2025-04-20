import Home from '../pages/Home/index.js';
import Product from '../pages/Product/index.js';
import Cart from '../pages/Cart/index.js';
import LoginAndRegister from '../pages/LoginandRegister/index.js';
import Info from '../pages/Info/index.js';
import Checkout from '../pages/Checkout/index.js';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/products', component: Product },
    { path: '/login', component: LoginAndRegister},
    { path: '/info', component: Info},
]

const privateRoutes = [
    { path: '/cart', component: Cart, layout: null },
    { path: '/checkout', component: Checkout },
]

export { publicRoutes, privateRoutes };