/**
 * 基础测试示例文件
 *
 * 本文件展示了 Vitest 的基本用法和常用测试模式
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('基础测试示例', () => {
  beforeEach(() => {
    // 每个测试前执行
  });

  afterEach(() => {
    // 每个测试后执行
    vi.clearAllMocks();
  });

  describe('断言示例', () => {
    it('应该通过基本断言', () => {
      expect(1 + 1).toBe(2);
      expect('hello').toBe('hello');
    });

    it('应该使用 toEqual 进行深度比较', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(obj1).toEqual(obj2);
    });

    it('应该检查类型和值', () => {
      expect(typeof 'string').toBe('string');
      expect(Array.isArray([])).toBe(true);
    });
  });

  describe('异步测试示例', () => {
    it('应该支持 async/await', async () => {
      const asyncFunction = async () => {
        return Promise.resolve('result');
      };

      const result = await asyncFunction();
      expect(result).toBe('result');
    });

    it('应该使用 resolves 测试 Promise', async () => {
      const promise = Promise.resolve('success');
      await expect(promise).resolves.toBe('success');
    });

    it('应该使用 rejects 测试失败的 Promise', async () => {
      const promise = Promise.reject(new Error('error'));
      await expect(promise).rejects.toThrow('error');
    });
  });

  describe('Mock 函数示例', () => {
    it('应该创建和调用 mock 函数', () => {
      const mockFn = vi.fn();
      mockFn('arg1', 'arg2');

      expect(mockFn).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该使用 mock 返回值', () => {
      const mockFn = vi.fn(() => 'mocked return');
      expect(mockFn()).toBe('mocked return');
    });

    it('应该使用 mockImplementation', () => {
      const mockFn = vi.fn().mockImplementation((x) => x * 2);
      expect(mockFn(5)).toBe(10);
    });
  });

  describe('Spy 示例', () => {
    it('应该监听对象方法', () => {
      const obj = {
        method: () => 'original',
      };

      const spy = vi.spyOn(obj, 'method');
      obj.method();
      expect(spy).toHaveBeenCalled();

      spy.mockReturnValue('mocked');
      expect(obj.method()).toBe('mocked');

      spy.mockRestore();
    });
  });
});
