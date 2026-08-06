import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

import { Home } from '../pages/public/Home';
import { ProductList } from '../pages/public/ProductList';
import { ProductDetail } from '../pages/public/ProductDetail';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';

import { Cart } from '../pages/buyer/Cart';
import { Checkout } from '../pages/buyer/Checkout';
import { MyPurchases } from '../pages/buyer/MyPurchases';
import { OrderDetail } from '../pages/buyer/OrderDetail';

import { Dashboard } from '../pages/seller/Dashboard';
import { MyProducts } from '../pages/seller/MyProducts';
import { ProductEditor } from '../pages/seller/ProductEditor';
import { MySales } from '../pages/seller/MySales';

import { Categories } from '../pages/admin/Categories';

export const router = createBrowserRouter([
  // Auth — hors du Layout : ces écrans occupent toute la fenêtre (split-screen)
  // et portent leur propre en-tête (le logo renvoie à l'accueil).
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  {
    element: <Layout />,
    children: [
      // Public — aucun token nécessaire (§ ordre de construction, étape 3
      // du dossier technique : le catalogue valide le socle sans dépendre
      // de l'auth)
      { path: '/', element: <Home /> },
      { path: '/products', element: <ProductList /> },
      { path: '/products/:id', element: <ProductDetail /> },

      // Authentifié, tout rôle confondu
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart', element: <Cart /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/my-purchases', element: <MyPurchases /> },
          { path: '/orders/:id', element: <OrderDetail /> },
        ],
      },

      // Vendeur uniquement
      {
        element: <RoleRoute allowed={['seller']} />,
        children: [
          { path: '/seller/dashboard', element: <Dashboard /> },
          { path: '/seller/products', element: <MyProducts /> },
          { path: '/seller/products/new', element: <ProductEditor /> },
          { path: '/seller/products/:id/edit', element: <ProductEditor /> },
          { path: '/seller/sales', element: <MySales /> },
        ],
      },

      // Admin uniquement
      {
        element: <RoleRoute allowed={['admin']} />,
        children: [{ path: '/admin/categories', element: <Categories /> }],
      },
    ],
  },
]);