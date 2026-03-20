import { lazy, Suspense } from 'react'

const HomeView = lazy(() => import('@/views/HomeView'))
const AboutView = lazy(() => import('@/views/AboutView'))

function withSuspense<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    )
  }
}

export const HomeViewLazy = withSuspense(HomeView)
export const AboutViewLazy = withSuspense(AboutView)

export { HomeView, AboutView }
