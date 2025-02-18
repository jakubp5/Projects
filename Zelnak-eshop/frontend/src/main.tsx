import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/main.scss'

import { ThemeProvider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import App from './App'
import { theme } from './styles/theme'

import 'dayjs/locale/cs'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CurrentUserProvider } from './context/CurrentUserContext'

const Main = () => {
    return (
        <React.StrictMode>
            <AuthProvider>
                <AppProviders />
            </AuthProvider>
        </React.StrictMode>
    )
}

const AppProviders = () => {
    const { userId, accessToken } = useAuth()

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
            <ThemeProvider theme={theme}>
                <CurrentUserProvider userId={userId} accessToken={accessToken}>
                    <CartProvider>
                        <App />
                    </CartProvider>
                </CurrentUserProvider>
            </ThemeProvider>
        </LocalizationProvider>
    )
}

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)

root.render(<Main />)
