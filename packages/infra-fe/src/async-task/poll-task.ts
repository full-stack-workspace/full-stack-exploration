/**
 * @file 轮询任务实现
 *
 * @description
 * 用于重复执行一个同步或异步任务，直到任务结果满足指定条件。
 * 更多轮询优化策略可参考：
 * https://www.insight-stack.cn/fullstack/networking-polling-optimization
 *
 * 注意：
 * 1. 轮询用于处理“请求成功，但业务任务尚未完成”的情况。
 *    单次请求发生网络异常时，应在 taskFn 内组合 executeWithRetry。
 * 2. 页面不可见时是否暂停或降低频率属于业务策略，本工具不擅自处理。
 * 3. 每次任务完成后才会等待 intervalMs 并开始下一次，因此不会产生
 *    多次轮询重叠执行的问题。
 */


type MaybePromise<T> = T | Promise<T>;

export interface PollContext {
  /** 当前是第几次轮询，从 1 开始。 */
  readonly attempt: number;

  /** 从 pollTask 开始到当前轮询开始时已经过去的时间。 */
  readonly elapsedMs: number;

  /**
   * 当前轮询任务使用的取消信号。
   *
   * 用户主动取消或整个轮询超时时，该 signal 会被中止。taskFn 如果
   * 调用 fetch 等支持 AbortSignal 的 API，应继续向下传递这个信号。
   */
  readonly signal: AbortSignal;
}


export type PollTask<T> = (
  context: PollContext,
) => MaybePromise<T>;

export type PollCondition<T> = (
  result: T,
  context: PollContext,
) => MaybePromise<boolean>;

export interface PollIntervalContext<T>
  extends PollContext {
  /** 当前轮询得到的结果。 */
  readonly result: T;
}

export type PollInterval<T> =
  | number
  | ((
      context: PollIntervalContext<T>,
    ) => MaybePromise<number>);

export interface PollOptions<T> {
  /**
   * 判断轮询是否已经完成。
   *
   * 返回 true：结束轮询并返回当前结果。
   * 返回 false：等待后继续下一次轮询。
   * 抛出异常：立即结束轮询并向调用方抛出该异常。
   */
  readonly until: PollCondition<T>;

  /**
   * 两次轮询之间的等待时间。
   *
   * 可以传固定毫秒数，也可以根据当前结果动态计算下一次等待时间。
   * 动态计算函数只会在 until 返回 false 且仍允许继续轮询时调用。
   *
   * @default 1000
   */
  readonly intervalMs?: PollInterval<T>;

  /**
   * 第一次执行前的等待时间，单位为毫秒。
   *
   * @default 0
   */
  readonly initialDelayMs?: number;

  /**
   * 整个轮询任务允许消耗的总时间，单位为毫秒。
   *
   * 总时间包括第一次等待、任务执行、条件判断和轮询间隔。超时后，
   * pollTask 会拒绝并中止传给 taskFn 的 signal。
   */
  readonly timeoutMs: number;

  /**
   * 最大轮询次数。
   *
   * 不传时只受 timeoutMs 限制。传入 1 表示最多执行 taskFn 一次。
   */
  readonly maxAttempts?: number;

  /** 外部取消信号，例如页面离开或用户点击取消。 */
  readonly signal?: AbortSignal;
}

// 默认间隔时间
const DEFAULT_INTERVAL_MS = 1_000;

/**
 * Web 与 Node.js 的定时器通常使用 32 位有符号整数保存延迟值。
 * 超过该值时，不同运行环境可能截断、溢出或把延迟缩短到约 1ms，
 * 因此这里显式拒绝无法被单个 setTimeout 安全表达的时间配置。
 */
const MAX_TIMER_DELAY_MS = 2_147_483_647;

/**
 * 因总时间超过 timeoutMs 而结束轮询时抛出的错误。
 */
export class PollTimeoutError extends Error {
  readonly attempts: number;
  readonly elapsedMs: number;

  constructor(attempts: number, elapsedMs: number) {
    super(`Polling timed out after ${Math.round(elapsedMs)}ms`);
    this.name = 'PollTimeoutError';
    this.attempts = attempts;
    this.elapsedMs = elapsedMs;
  }
}

/**
 * 达到 maxAttempts，但最后一次结果仍未满足 until 时抛出的错误。
 */
export class PollAttemptsExceededError<T = unknown>
  extends Error {
  readonly attempts: number;
  readonly elapsedMs: number;
  readonly lastResult: T;

  constructor(
    attempts: number,
    elapsedMs: number,
    lastResult: T,
  ) {
    super(`Polling did not complete after ${attempts} attempts`);
    this.name = 'PollAttemptsExceededError';
    this.attempts = attempts;
    this.elapsedMs = elapsedMs;
    this.lastResult = lastResult;
  }
}

/**
 * 校验一个时间配置是否能被 setTimeout 安全表达。
 */
function assertNonNegativeDuration(
  name: string,
  value: number,
): void {
  if (
    !Number.isFinite(value)
    || value < 0
    || value > MAX_TIMER_DELAY_MS
  ) {
    throw new RangeError(
      `${name} must be between 0 and ${MAX_TIMER_DELAY_MS}`,
    );
  }
}

/** timeoutMs 还要求严格大于 0，因为 0ms 的轮询没有执行机会。 */
function assertPositiveDuration(name: string, value: number): void {
  assertNonNegativeDuration(name, value);

  if (value === 0) {
    throw new RangeError(`${name} must be greater than 0`);
  }
}

/**
 * 获取 AbortSignal 的取消原因。
 *
 * 现代运行环境会自动提供 signal.reason；后备 DOMException 使错误在旧
 * 环境中仍然具有标准的 AbortError 名称。
 */
function getAbortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException(
    'The operation was aborted',
    'AbortError',
  );
}

/** 在已取消时同步抛出 signal 的原始取消原因。 */
function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw getAbortReason(signal);
  }
}

/**
 * 执行一个同步或异步操作，并在 signal 取消时立即拒绝等待。
 *
 * Promise.resolve().then(factory) 有两个作用：
 * 1. 将普通返回值统一为 Promise；
 * 2. 将 factory 同步抛出的异常统一转换为 Promise rejection。
 *
 * 需要注意：如果 factory 内部的操作不支持 AbortSignal，这里只能停止
 * 等待它，无法强制终止已经开始的底层工作。
 */
function runWithSignal<T>(
  factory: () => MaybePromise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(getAbortReason(signal));
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => {
      cleanup();
      reject(getAbortReason(signal));
    };

    // 使用函数声明以利用 hoisting：onAbort 与 cleanup 相互引用，
    // 函数声明允许在声明位置之前被引用。
    function cleanup(): void {
      signal.removeEventListener('abort', onAbort);
    }

    signal.addEventListener('abort', onAbort, { once: true });

    Promise.resolve()
      .then(factory)
      .then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (error: unknown) => {
          cleanup();
          reject(error);
        },
      );
  });
}

/**
 * 等待指定时间，并支持在等待期间取消。
 *
 * 即使 delayMs 为 0，也使用 setTimeout 进入下一个宏任务，避免条件一直
 * 不满足时形成只由微任务组成的紧密循环，长期占用事件循环。
 */
function delay(
  delayMs: number,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(getAbortReason(signal));
  }

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);

    const onAbort = (): void => {
      clearTimeout(timer);
      cleanup();
      reject(getAbortReason(signal));
    };

    // 使用函数声明以利用 hoisting：onAbort 与 cleanup 相互引用，
    // 函数声明允许在声明位置之前被引用。
    function cleanup(): void {
      signal.removeEventListener('abort', onAbort);
    }

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * 轮询执行任务，直到任务结果满足 options.until。
 *
 * 调度采用“完成后等待”模型：一次 taskFn 和 until 完成后，才计算并
 * 等待 intervalMs，然后开始下一次。任何时刻最多只会运行一次 taskFn。
 */
export async function pollTask<T>(taskFn: PollTask<T>, options: PollOptions<T>): Promise<T> {
  if (typeof taskFn !== 'function') {
    throw new TypeError('taskFn must be a function');
  }

  if (typeof options?.until !== 'function') {
    throw new TypeError('options.until must be a function');
  }

  const {
    until,
    intervalMs = DEFAULT_INTERVAL_MS,
    initialDelayMs = 0,
    timeoutMs,
    maxAttempts,
    signal: externalSignal,
  } = options;

  assertPositiveDuration('timeoutMs', timeoutMs);
  assertNonNegativeDuration('initialDelayMs', initialDelayMs);

  if (typeof intervalMs === 'number') {
    assertNonNegativeDuration('intervalMs', intervalMs);
  }

  if (
    maxAttempts !== undefined
    && (!Number.isInteger(maxAttempts) || maxAttempts < 1)
  ) {
    throw new RangeError('maxAttempts must be a positive integer');
  }

  const startedAt = performance.now();
  const pollingController = new AbortController();
  const pollingSignal = pollingController.signal;

  let attempts = 0;

  /** 当前轮询已经消耗的总时间。 */
  const getElapsedMs = (): number => performance.now() - startedAt;

  /**
   * 外部 signal 与内部 controller 手动组合，避免依赖较新的
   * AbortSignal.any()，同时便于在 finally 中移除事件监听器。
   */
  const onExternalAbort = (): void => {
    if (!pollingSignal.aborted) {
      pollingController.abort(getAbortReason(externalSignal!));
    }
  };

  if (externalSignal?.aborted) {
    pollingController.abort(getAbortReason(externalSignal));
  } else {
    externalSignal?.addEventListener(
      'abort',
      onExternalAbort,
      { once: true },
    );
  }

  /**
   * 总超时到达时中止统一 signal。runWithSignal 和 delay 都监听这个
   * signal，因此无论当时处于任务执行还是等待阶段，pollTask 都会拒绝。
   */
  const timeoutTimer = setTimeout(() => {
    if (!pollingSignal.aborted) {
      pollingController.abort(
        new PollTimeoutError(attempts, getElapsedMs()),
      );
    }
  }, timeoutMs);

  /**
   * 定时器无法抢占一段正在同步执行的 JavaScript。如果 taskFn 长时间
   * 阻塞事件循环，超时回调可能无法准时运行，因此每个异步边界之后还要
   * 主动比较实际耗时，保证总超时语义。
   */
  const assertWithinDeadline = (): void => {
    throwIfAborted(pollingSignal);

    const elapsedMs = getElapsedMs();

    if (elapsedMs >= timeoutMs) {
      const error = new PollTimeoutError(attempts, elapsedMs);

      if (!pollingSignal.aborted) {
        pollingController.abort(error);
      }

      throw error;
    }
  };

  try {
    throwIfAborted(pollingSignal);

    if (initialDelayMs > 0) {
      await delay(initialDelayMs, pollingSignal);
      assertWithinDeadline();
    }

    while (true) {
      assertWithinDeadline();
      attempts += 1;

      const context: PollContext = {
        attempt: attempts,
        elapsedMs: getElapsedMs(),
        signal: pollingSignal,
      };

      const result = await runWithSignal(
        () => taskFn(context),
        pollingSignal,
      );

      assertWithinDeadline();

      const completed = await runWithSignal(
        () => until(result, context),
        pollingSignal,
      );

      assertWithinDeadline();

      if (typeof completed !== 'boolean') {
        throw new TypeError('options.until must return a boolean');
      }

      if (completed) {
        return result;
      }

      if (
        maxAttempts !== undefined
        && attempts >= maxAttempts
      ) {
        throw new PollAttemptsExceededError(
          attempts,
          getElapsedMs(),
          result,
        );
      }

      const nextIntervalMs = typeof intervalMs === 'function'
        ? await runWithSignal(
            () => intervalMs({
              attempt: attempts,
              elapsedMs: getElapsedMs(),
              signal: pollingSignal,
              result,
            }),
            pollingSignal,
          )
        : intervalMs;

      assertNonNegativeDuration('intervalMs', nextIntervalMs);
      assertWithinDeadline();

      await delay(nextIntervalMs, pollingSignal);
    }
  } finally {
    clearTimeout(timeoutTimer);
    externalSignal?.removeEventListener(
      'abort',
      onExternalAbort,
    );
  }
}
