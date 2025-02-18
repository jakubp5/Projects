import { Suspense } from 'react'
import { CircularProgress } from '@mui/material'

const Loadable = (Component: React.ComponentType<any>) => (props: any) =>
    (
        <Suspense fallback={<CircularProgress />}>
            <Component {...props} />
        </Suspense>
    )

export default Loadable
