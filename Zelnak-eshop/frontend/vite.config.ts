import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

    if (mode === 'development') {
    } else if (mode === 'production') {
    }

    const getOutputDir = (mode: string) => {
        if (mode === 'development') {
            return 'dist_development'
        } else if (mode === 'production') {
            return 'dist_production'
        }

        return 'dist'
    }

    console.log('output dir: ', getOutputDir(mode))
    console.log(process.env.VITE_API_URL)

    return defineConfig({
        plugins: [react()],
        build: {
            outDir: getOutputDir(mode),
            target: 'esnext',
        },
        base: '/zelnak-app/',
        server: {
            proxy: {
                '/api': {
                    target: process.env.VITE_API_URL,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
    })
}
