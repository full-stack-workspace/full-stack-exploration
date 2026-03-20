export default function AboutView() {
  return (
    <div className="about">
      <h1>About Vite Server</h1>
      <p>This package focuses on learning Vite dev server features.</p>
      <h2>What you can learn here:</h2>
      <ul style={{ textAlign: 'left', display: 'inline-block' }}>
        <li>Dev server port configuration</li>
        <li>Proxy configuration for API requests</li>
        <li>CORS and custom headers</li>
        <li>ConfigureServer middleware</li>
        <li>HMR behavior customization</li>
      </ul>
    </div>
  )
}
