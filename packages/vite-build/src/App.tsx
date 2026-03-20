import { Link, useRoutes } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { routes } from './routes'

const { Header, Content } = Layout

export default function App() {
  const element = useRoutes(routes)

  const items: MenuProps['items'] = [
    {
      label: <Link to="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />
    },
    {
      label: <Link to="/about">About</Link>,
      key: '/about',
      icon: <InfoCircleOutlined />
    }
  ]

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" items={items} />
      </Header>
      <Content style={{ padding: '20px 50px' }}>
        <div className="site-layout-content">{element}</div>
      </Content>
    </Layout>
  )
}
