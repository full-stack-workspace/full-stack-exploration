import { lazy, Suspense } from 'react'
import { RouteObject } from 'react-router-dom';
import HomeView from '@/views/HomeView'
// import AboutView from '@/views/AboutView'

const AboutView = lazy(() => import('@/views/AboutView'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeView />
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AboutView />
      </Suspense>
    )
  }
]
