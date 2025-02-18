import variables from './variables.module.scss'

type ThemeVariables = {
    breakpointXs: string
    breakpointSm: string
    breakpointMd: string
    breakpointLg: string
    breakpointXl: string
    breakpoint2xl: string

    fontSizeSmall: string
    fontSizeMedium: string
    fontSizeLarge: string
    fontSizeXlarge: string

    fontFamilyPrimary: string
    fontFamilySecondary: string
    fontFamilyTertiary: string

    fontFamilyText: string
    fontFamilyHeadings: string

    bodyFontSize: string

    containerWidth: string
}

export default variables as ThemeVariables
