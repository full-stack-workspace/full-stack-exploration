/**
 * Header 组件单元测试示例
 *
 * 本文件展示了如何使用 Vitest + React Testing Library 编写 React 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import Header from './Header';

describe('Header', () => {
  it('应该渲染组件标题', () => {
    render(<Header />);

    // 使用 screen.getByText 查找文本内容
    const title = screen.getByText('Teek');
    expect(title).toBeInTheDocument();
  });

  it('应该渲染所有导航链接', () => {
    render(<Header />);

    // 检查导航链接是否存在
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Hooks')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Relay Example')).toBeInTheDocument();
  });

  it('导航链接应该具有正确的 href 属性', () => {
    render(<Header />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    const hooksLink = screen.getByRole('link', { name: /hooks/i });
    const shoppingCartLink = screen.getByRole('link', { name: /shopping cart/i });
    const relayExampleLink = screen.getByRole('link', { name: /relay example/i });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(hooksLink).toHaveAttribute('href', '/hooks');
    expect(shoppingCartLink).toHaveAttribute('href', '/shopping-cart');
    expect(relayExampleLink).toHaveAttribute('href', '/relay-example');
  });

  it('应该具有正确的 CSS 类名', () => {
    const { container } = render(<Header />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-white', 'shadow-md');
  });
});
