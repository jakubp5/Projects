import { Box, Paper, SxProps, Theme } from '@mui/material'

interface ZelnakBoxProps {
    children: React.ReactNode
    parentSx?: SxProps<Theme>
    sx?: SxProps<Theme>
}

const ZelnakBox = (props: ZelnakBoxProps) => {
    const { children, parentSx, sx } = props

    return (
        <Box
            className="zelnak-box"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 5,
                ...parentSx,
            }}>
            <Paper elevation={3} sx={{ p: 3, width: '760px', ...sx }}>
                {children}
            </Paper>
        </Box>
    )
}

export default ZelnakBox
