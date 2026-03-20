import { RouteObject } from 'react-router-dom'
import HomeView from '@/views/HomeView'
import AboutView from '@/views/AboutView'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeView />
  },
  {
    path: '/about',
    element: <AboutView />
  }
]
