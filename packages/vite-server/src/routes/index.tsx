import { RouteObject } from 'react-router-dom'
import { HomeViewLazy, AboutViewLazy } from './lazy'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeViewLazy />
  },
  {
    path: '/about',
    element: <AboutViewLazy />
  }
]
