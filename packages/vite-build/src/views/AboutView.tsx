import { Card, Typography, List } from 'antd'

const { Title, Paragraph } = Typography

export default function AboutView() {
  const buildFeatures = [
    'Manual and automatic code splitting',
    'Chunk splitting strategy (manualChunks)',
    'Minification options (terser/esbuild)',
    'Bundle analysis with vite-bundle-analyzer',
    'Treeshaking and sideEffects',
    'Preload and prefetch configuration',
    'External dependencies (external)'
  ]

  return (
    <div className="about">
      <Card>
        <Title level={2}>About Vite Build</Title>
        <Paragraph>
          This package focuses on learning Vite build optimization features.
        </Paragraph>

        <Title level={3}>What you can learn here:</Title>
        <List
          dataSource={buildFeatures}
          renderItem={(item) => <List.Item>• {item}</List.Item>}
        />
      </Card>
    </div>
  )
}
