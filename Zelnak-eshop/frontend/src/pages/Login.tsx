import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../api/apiPost'
import { ZelnakButton } from '../components/ZelnakButton'
import { ZelnakInput } from '../components/ZelnakInput'
import { useAuth } from '../context/AuthContext'
import { LocalStorage, Routes } from '../enums'
import colors from '../styles/colors'
import { wait } from '../utils/myUtils'

export interface LoginFormProps {}

interface UserData {
    username: string
    password: string
}

interface Values extends UserData {
    error: string
    loading: boolean
    success: boolean
}

interface LoginData {
    username: string
    password: string
}

const login = async (loginData: LoginData): Promise<any> => {
    const url = '/login'
    return apiPost<any>(url, loginData)
}

const Login = (_props: LoginFormProps) => {
    const { setAccessToken, setUserId } = useAuth()

    const navigate = useNavigate()

    const [values, setValues] = useState<Values>({
        username: '',
        password: '',
        error: '',
        loading: false,
        success: false,
    })

    const handleSubmit = async () => {
        if (values.username && values.password) {
            setValues({ ...values, loading: true })

            const userData: LoginData = {
                username: values.username,
                password: values.password,
            }

            login(userData)
                .then(async (response) => {
                    const token = response.token
                    const user_id = response.id
                    setValues({
                        ...values,
                        error: '',
                        success: true,
                        loading: false,
                    })

                    setAccessToken(token)
                    setUserId(user_id)
                    localStorage.setItem(LocalStorage.AccessToken, token)
                    localStorage.setItem(LocalStorage.UserId, user_id)

                    await wait(500).then(() => {
                        navigate(Routes.Homepage, { replace: true })
                    })
                })
                .catch((error) => {
                    setValues({
                        ...values,
                        error: 'Prihlásenie sa nepodarilo. '+ error,
                        success: false,
                        loading: false,
                    })

                    setAccessToken(null)
                    setUserId(null)
                    localStorage.removeItem(LocalStorage.AccessToken)
                    localStorage.removeItem(LocalStorage.UserId)
                })
        }
    }

    const handleChange = (inputKey: keyof Values, value: Values[keyof Values]) => {
        const newData: Values = { ...values, [inputKey]: value }
        setValues(newData)
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100svh',
                backgroundColor: colors.colorBackground,
            }}>
            <Box
                maxWidth={640}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <Typography component="h1" variant="h1" marginBottom={5}>
                    Přihlášení
                </Typography>
                <Stack
                    width={'100%'}
                    component="form"
                    noValidate
                    spacing={2}
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }}>
                    <ZelnakInput<Values>
                        label={'Uživatelské jméno'}
                        inputKey="username"
                        value={values.username}
                        type="text"
                        setValue={handleChange}
                        fullWidth
                        inputProps={{
                            size: 'medium',
                            sx: { width: '400px' },
                        }}
                    />

                    <ZelnakInput<Values>
                        label={'Heslo'}
                        inputKey="password"
                        value={values.password}
                        type="password"
                        setValue={handleChange}
                        fullWidth
                        inputProps={{
                            size: 'medium',
                            sx: { width: '400px' },
                        }}
                    />

                    <ZelnakButton
                        type="submit"
                        size={'medium'}
                        sx={{ mt: 3, mb: 2, mx: 'auto', display: 'block' }}>
                        {values.loading ? (
                            <CircularProgress size={28} color="secondary" />
                        ) : (
                            'Přihlásit se'
                        )}
                    </ZelnakButton>

                    {values.error && (
                        <Typography color="error" variant="body2">
                            {values.error}
                        </Typography>
                    )}

                    {values.success && (
                        <Typography color="success" variant="body2">
                            Přihlášení proběhlo úspěšně, přesměrovávám...
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Box>
    )
}

export default Login
