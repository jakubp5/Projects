import { Box } from '@mui/material'
import Navbar from '../../components/Navbar'

interface LayoutProps {
    children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
    const { children } = props

    return (
        <Box className="main-layout">
            <Navbar />
            {children}
        </Box>
    )
}

export default Layout
