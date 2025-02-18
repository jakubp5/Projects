import { createHashRouter } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { Routes } from './enums/Routes.ts'
import { UserRole } from './enums/UserRole.ts'
import AddCategory from './pages/AddCategory.tsx'
import AddEvent from './pages/AddEvent.tsx'
import AddProduct from './pages/AddProduct.tsx'
import AdminPage from './pages/AdminPage.tsx'
import Cart from './pages/Cart.tsx'
import CategoriesPage from './pages/CategoryPage.tsx'
import FarmerProfile from './pages/FarmerProfile.tsx'
import Homepage from './pages/Homepage/Homepage.tsx'
import Login from './pages/Login.tsx'
import OrderDetail from './pages/Profile/OrderDetail.tsx'
import ProfilePage from './pages/Profile/ProfilePage.tsx'
import Register from './pages/Register.tsx'
const applicationRouter = createHashRouter([
    {
        path: Routes.Homepage,
        element: <Homepage />,
    },
    {
        path: Routes.Register, // Add this to Routes enum
        element: <Register />,
    },
    {
        path: Routes.Login, // Add this to Routes enum
        element: <Login />,
    },
    {
        path: Routes.Profile,
        element: (
            <ProtectedRoute
                element={<ProfilePage />}
                allowedRoles={[
                    UserRole.Customer,
                    UserRole.Registered,
                    UserRole.Admin,
                    UserRole.Farmer,
                    UserRole.Moderator,
                ]}
            />
        ),
    },
    {
        path: Routes.Orders + '/:id',
        element: (
            <ProtectedRoute
                element={<OrderDetail />}
                allowedRoles={[UserRole.Admin, UserRole.Customer]}
            />
        ),
    },

    {
        path: Routes.AddProduct,
        element: (
            <ProtectedRoute
                element={<AddProduct />}
                allowedRoles={[UserRole.Farmer, UserRole.Registered]}
            />
        ),
    },
    {
        path: Routes.Categories,
        element: (
            <ProtectedRoute element={<CategoriesPage />} allowedRoles={[UserRole.Moderator]} />
        ),
    },
    {
        path: Routes.AddCategory,
        element: (
            <ProtectedRoute
                element={<AddCategory />}
                allowedRoles={[UserRole.Customer, UserRole.Moderator, UserRole.Registered]}
            />
        ),
    },
    {
        path: Routes.FarmerProfile + '/:id',
        element: <FarmerProfile />,
    },
    {
        path: '/admin',
        element: <ProtectedRoute element={<AdminPage />} allowedRoles={[UserRole.Admin]} />,
    },
    {
        path: Routes.Cart,
        element: (
            <ProtectedRoute
                element={<Cart />}
                allowedRoles={[UserRole.Customer, UserRole.Registered]}
            />
        ),
    },
    {
        path: Routes.AddEvent,
        element: <AddEvent />,
    },
    {
        path: Routes.EditEvent + '/:id',
        element: (
            <ProtectedRoute
                element={<AddEvent edit={true} />}
                allowedRoles={[UserRole.Admin, UserRole.Farmer]}
            />
        ),
    },
    {
        path: Routes.EditProduct + '/:id',
        element: (
            <ProtectedRoute
                element={<AddProduct edit={true} />}
                allowedRoles={[UserRole.Admin, UserRole.Farmer]}
            />
        ),
    },
])

const getRouter = () => {
    return applicationRouter
}

const router = getRouter()
export { router }
