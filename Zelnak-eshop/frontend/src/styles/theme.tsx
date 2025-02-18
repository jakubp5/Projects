import { createTheme } from '@mui/material'
import colors from '../styles/colors'
import variables from '../styles/variables'

declare module '@mui/material/styles' {
    interface Palette {
        white: Palette['primary']
    }
    interface PaletteOptions {
        white?: PaletteOptions['primary']
    }
}

declare module '@mui/material/Typography' {}

export const theme = createTheme({
    palette: {
        primary: {
            main: colors.colorPrimary,
            dark: colors.colorPrimaryDark,
            contrastText: colors.colorSecondary,
        },
        secondary: {
            main: colors.colorSecondary,
            dark: colors.colorSecondaryDark,
            contrastText: colors.colorWhite,
        },
        text: {
            primary: colors.colorText,
        },
        white: {
            main: colors.colorWhite,
        },
        error: {
            main: colors.colorError,
        },
        background: {
            default: colors.colorBackground,
        },
    },

    breakpoints: {
        values: {
            xs: parseInt(variables.breakpointXs) * parseInt(variables.bodyFontSize),
            sm: parseInt(variables.breakpointSm) * parseInt(variables.bodyFontSize),
            md: parseInt(variables.breakpointMd) * parseInt(variables.bodyFontSize),
            lg: parseInt(variables.breakpointLg) * parseInt(variables.bodyFontSize),
            xl: parseInt(variables.breakpointXl) * parseInt(variables.bodyFontSize),
        },
    },

    typography: {
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 16,
        h1: {
            fontSize: variables.fontSizeLarge,
            fontWeight: 400,
            '@media (min-width: 48rem)': {
                fontSize: variables.fontSizeXlarge,
            },
        },
        h2: {
            fontSize: variables.fontSizeXlarge,
            fontWeight: 400,
            '@media (min-width: 48rem)': {
                fontSize: variables.fontSizeLarge,
            },
        },
        h3: {
            fontSize: variables.fontSizeLarge,
            fontWeight: 400,
            '@media (min-width: 48rem)': {
                fontSize: variables.fontSizeMedium,
            },
        },

        body1: {
            fontSize: variables.fontSizeMedium,
            fontWeight: 'bold',
            marginBottom: 0,
            color: colors.colorText,
        },
        body2: {
            fontSize: variables.fontSizeSmall,
            fontWeight: 'bold',
            marginBottom: 0,
            color: colors.colorText,
        },
    },
})
