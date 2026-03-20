import { Link, useRoutes } from 'react-router-dom'
import { routes } from './routes'

export default function App() {
  const element = useRoutes(routes)

  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link> |
        <Link to="/about">About</Link>
      </nav>
      {element}
    </div>
  )
}
