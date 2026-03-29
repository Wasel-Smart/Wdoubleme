import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  lastRenderTime: number;
}

export function usePerformanceMonitor(componentName: string, enabled = import.meta.env.DEV) {
  const renderCount = useRef(0);
  const renderStartTime = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    lastRenderTime: 0
  });

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;

    metrics.current = {
      renderCount: renderCount.current,
      renderTime: metrics.current.renderTime + renderTime,
      lastRenderTime: renderTime
    };

    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (frame budget exceeded)`,
        {
          renderCount: renderCount.current,
          averageRenderTime: (metrics.current.renderTime / renderCount.current).toFixed(2) + 'ms'
        }
      );
    }
  });

  // Mark render start
  renderStartTime.current = performance.now();

  const getMetrics = useCallback(() => metrics.current, []);

  const logMetrics = useCallback(() => {
    if (!enabled) return;
    
    console.log(`[Performance Metrics] ${componentName}`, {
      totalRenders: metrics.current.renderCount,
      totalRenderTime: metrics.current.renderTime.toFixed(2) + 'ms',
      averageRenderTime: (metrics.current.renderTime / metrics.current.renderCount).toFixed(2) + 'ms',
      lastRenderTime: metrics.current.lastRenderTime.toFixed(2) + 'ms'
    });
  }, [componentName, enabled]);

  return { getMetrics, logMetrics };
}