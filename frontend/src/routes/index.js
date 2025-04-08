import Home from '../pages/Home/index.js';
import Product from '../pages/Product/index.js';
import Cart from '../pages/Cart/index.js';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/products', component: Product },
]
const privateRoutes = [
    { path: '/cart', component: Cart, layout: null },
]
export { publicRoutes, privateRoutes };