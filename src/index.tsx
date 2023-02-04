import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthWrapper from './components/auth-wrapper/auth-wrapper';
import './index.css';
import Dashboard from './pages/dashboard/dashboard';
import Settings from './pages/settings/settings';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Dashboard />
    },
    {
        path: '/settings',
        element: <Settings />
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>
    </React.StrictMode>
);
