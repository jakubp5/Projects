import { Button, ButtonProps, SxProps } from '@mui/material'

import variables from '../styles/variables'
import colors from '../styles/colors'
import { Theme } from '@emotion/react'

export interface ZelnakButtonProps extends Omit<ButtonProps, 'className' | 'variant' | 'size'> {
    className?: string
    variant?: 'primary' | 'secondary' | 'primaryOutline'
    size?: 'medium' | 'large'
    sx?: SxProps<Theme>

    children: React.ReactNode
}
export const ZelnakButton = (props: ZelnakButtonProps) => {
    const {
        children,
        size = 'medium',
        variant = 'primary',
        sx,
        className,
        onClick,
        ...rest
    } = props

    const sizeButtons = {
        medium: {
            fontSize: variables.fontSizeSmall,
            paddingX: 4,
            paddingY: 0.5,
            borderRadius: '999px',
        },
        large: {
            fontSize: variables.fontSizeMedium,
            paddingX: 6,
            paddingY: 1,
            borderRadius: '999px',
        },
    }

    const variantButtons = {
        primary: {
            color: colors.colorWhite,
            backgroundColor: colors.colorPrimary,
            backgroundColorHover: colors.colorPrimaryDark,
            focusShadow: colors.colorPrimaryDark,
            border: 'none',
        },
        secondary: {
            color: colors.colorWhite,
            backgroundColor: colors.colorSecondary,
            backgroundColorHover: colors.colorSecondaryDark,
            focusShadow: colors.colorSecondaryDark,
            border: 'none',
        },
        primaryOutline: {
            color: colors.colorPrimary,
            backgroundColor: colors.colorWhite,
            backgroundColorHover: colors.colorWhite,
            focusShadow: colors.colorWhite,
            border: `1px solid ${colors.colorPrimary}`,
        },
    }

    return (
        <>
            <Button
                onClick={onClick}
                className={className}
                sx={{
                    fontSize: sizeButtons[size].fontSize,
                    paddingX: sizeButtons[size].paddingX,
                    paddingY: sizeButtons[size].paddingY,
                    fontWeight: 'bold',
                    borderRadius: sizeButtons[size].borderRadius,
                    color: variantButtons[variant].color,
                    backgroundColor: variantButtons[variant].backgroundColor,
                    border: variantButtons[variant].border,
                    ':hover': {
                        backgroundColor: variantButtons[variant].backgroundColorHover,
                    },
                    ':focus': {
                        boxShadow: `1px 0 0 0 ${variantButtons[variant].focusShadow}`,
                    },
                    ...sx,
                }}
                {...rest}>
                {children}
            </Button>
        </>
    )
}
