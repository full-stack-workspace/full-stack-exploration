import { useAtom } from 'jotai'
import { useCounter, useLocalStorage } from '@/hooks'
import { counterAtom, themeWithPersistenceAtom } from '@/store'

export default function HomeView() {
  const { count, increment, decrement, reset } = useCounter(0)
  const [jotaiCount, setJotaiCount] = useAtom(counterAtom)
  const [theme, setTheme] = useAtom(themeWithPersistenceAtom)
  const [name, setName] = useLocalStorage('name', 'Guest')

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="home">
      <h1>Welcome to Vite Server</h1>
      <p>Learn Vite dev server configuration!</p>

      <div className="section">
        <h2>Local State Counter</h2>
        <p>Count: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="section">
        <h2>Jotai State Counter</h2>
        <p>Count: {jotaiCount}</p>
        <button onClick={() => setJotaiCount((c) => c + 1)}>+</button>
        <button onClick={() => setJotaiCount((c) => c - 1)}>-</button>
        <button onClick={() => setJotaiCount(0)}>Reset</button>
      </div>

      <div className="section">
        <h2>Theme (persisted)</h2>
        <p>Current theme: {theme}</p>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>

      <div className="section">
        <h2>Local Storage Hook</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <p>Hello, {name}!</p>
      </div>
    </div>
  )
}
