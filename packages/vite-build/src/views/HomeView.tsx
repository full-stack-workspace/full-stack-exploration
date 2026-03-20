import { useState } from 'react'
import { Button, Card, Typography, Input, Switch, Space } from 'antd'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useCounterStore } from '@/store'
import { useDebounce, useToggle } from '@/hooks'

const { Title, Paragraph, Text } = Typography

export default function HomeView() {
  const { count, increment, decrement, reset } = useCounterStore()
  const { value: isDark, toggle: toggleTheme } = useToggle(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  return (
    <div className="home">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>Welcome to Vite Build</Title>
          <Paragraph>Learn Vite build optimization features!</Paragraph>
        </Card>

        <Card title="Zustand Counter">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={increment}
            >
              Increment
            </Button>
            <Button icon={<MinusOutlined />} onClick={decrement}>
              Decrement
            </Button>
            <Button icon={<ReloadOutlined />} onClick={reset}>
              Reset
            </Button>
          </Space>
          <Title level={3} style={{ marginTop: '20px' }}>
            Count: {count}
          </Title>
        </Card>

        <Card title="Debounce Example">
          <Input
            placeholder="Type something..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Text>Debounced value: {debouncedSearch}</Text>
        </Card>

        <Card title="Toggle Example">
          <Space>
            <Text>Dark Mode:</Text>
            <Switch checked={isDark} onChange={toggleTheme} />
          </Space>
          <Paragraph style={{ marginTop: '10px' }}>
            Dark mode is {isDark ? 'enabled' : 'disabled'}
          </Paragraph>
        </Card>
      </Space>
    </div>
  )
}
