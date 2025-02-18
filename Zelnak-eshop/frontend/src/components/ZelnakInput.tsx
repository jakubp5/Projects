import React from 'react'
import { FormControl, FormLabel, SxProps, TextField, TextFieldProps } from '@mui/material'
import { Theme } from '@emotion/react'

export interface ZelnakInputProps<T> {
    title?: string
    label?: string
    type: HTMLInputElement['type']
    inputKey: keyof T
    disabled?: boolean
    value: T[keyof T]
    setValue: (inputKey: keyof T, value: T[keyof T]) => void
    fullWidth?: boolean
    sx?: SxProps<Theme>
    inputProps?: TextFieldProps
    maxLength?: number
    placeholder?: string
}

export const ZelnakInput = <T extends object>(props: ZelnakInputProps<T>) => {
    const {
        title,
        label,
        type,
        inputKey,
        disabled,
        value,
        setValue,
        fullWidth,
        sx,
        inputProps,
        maxLength,
        ...rest
    } = props

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (maxLength && event.target.value.length > maxLength) return

        setValue(inputKey, event.target.value as T[keyof T])
    }

    return (
        <FormControl fullWidth={fullWidth} sx={{ ...sx }} {...rest}>
            {title && (
                <FormLabel htmlFor={inputKey as string} sx={{ mb: 0 }}>
                    {title}
                </FormLabel>
            )}
            <TextField
                autoComplete="off"
                id={inputKey as string}
                name={inputKey as string}
                type={type}
                size={'medium'}
                variant={'outlined'}
                label={title || label}
                placeholder={props.placeholder}
                disabled={disabled}
                value={value ? value : ''} // uncontrolled fix
                onChange={handleChange}
                {...inputProps}
            />
        </FormControl>
    )
}
