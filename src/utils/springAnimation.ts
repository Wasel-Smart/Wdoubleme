/**
 * LEVEL 2: MOTION PSYCHOLOGY
 * Spring-based animations for natural, smooth motion
 */

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  velocity?: number;
}

interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  onComplete?: () => void;
}

// Spring presets for common UI patterns
export const SpringPresets = {
  // Quick and responsive
  default: { stiffness: 170, damping: 26, mass: 1 },
  
  // Smooth and gentle
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  
  // Bouncy and playful
  bouncy: { stiffness: 180, damping: 12, mass: 1 },
  
  // Slow and smooth
  slow: { stiffness: 100, damping: 20, mass: 1 },
  
  // Fast and snappy
  snappy: { stiffness: 300, damping: 30, mass: 1 },
  
  // Ultra smooth for critical animations
  molasses: { stiffness: 80, damping: 18, mass: 1 }
} as const;

class SpringAnimationEngine {
  /**
   * Calculate spring animation values
   */
  private calculateSpring(
    from: number,
    to: number,
    config: SpringConfig,
    time: number
  ): number {
    const { stiffness, damping, mass, velocity = 0 } = config;
    
    const displacement = from - to;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocity;
    const acceleration = (springForce + dampingForce) / mass;
    
    const newVelocity = velocity + acceleration * time;
    const newPosition = from + newVelocity * time;
    
    return newPosition;
  }

  /**
   * Animate element with spring physics
   */
  animateSpring(
    element: HTMLElement,
    property: string,
    from: number,
    to: number,
    config: SpringConfig = SpringPresets.default,
    options: AnimationOptions = {}
  ): () => void {
    const { onComplete } = options;
    const startTime = performance.now();
    let animationFrame: number;
    let currentValue = from;
    let currentVelocity = config.velocity || 0;
    const threshold = 0.01; // Stop when close enough
    
    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      const deltaTime = 1 / 60; // Assume 60fps
      
      // Calculate spring physics
      const displacement = currentValue - to;
      const springForce = -config.stiffness * displacement;
      const dampingForce = -config.damping * currentVelocity;
      const acceleration = (springForce + dampingForce) / config.mass;
      
      currentVelocity += acceleration * deltaTime;
      currentValue += currentVelocity * deltaTime;
      
      // Apply to element
      if (property === 'opacity') {
        element.style.opacity = currentValue.toString();
      } else if (property === 'translateX' || property === 'translateY') {
        const transform = element.style.transform || '';
        const newTransform = transform.replace(
          new RegExp(`${property}\\([^)]+\\)`),
          ''
        ) + ` ${property}(${currentValue}px)`;
        element.style.transform = newTransform.trim();
      } else if (property === 'scale') {
        const transform = element.style.transform || '';
        const newTransform = transform.replace(
          /scale\([^)]+\)/,
          ''
        ) + ` scale(${currentValue})`;
        element.style.transform = newTransform.trim();
      } else {
        element.style.setProperty(property, `${currentValue}px`);
      }
      
      // Continue if not settled
      if (Math.abs(displacement) > threshold || Math.abs(currentVelocity) > threshold) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Snap to final value
        if (property === 'opacity') {
          element.style.opacity = to.toString();
        } else if (property === 'translateX' || property === 'translateY') {
          const transform = element.style.transform || '';
          const newTransform = transform.replace(
            new RegExp(`${property}\\([^)]+\\)`),
            ''
          ) + ` ${property}(${to}px)`;
          element.style.transform = newTransform.trim();
        } else if (property === 'scale') {
          const transform = element.style.transform || '';
          const newTransform = transform.replace(
            /scale\([^)]+\)/,
            ''
          ) + ` scale(${to})`;
          element.style.transform = newTransform.trim();
        } else {
          element.style.setProperty(property, `${to}px`);
        }
        
        onComplete?.();
      }
    };
    
    // Start animation
    element.style.willChange = property;
    animationFrame = requestAnimationFrame(animate);
    
    // Return cancel function
    return () => {
      cancelAnimationFrame(animationFrame);
      element.style.willChange = 'auto';
    };
  }

  /**
   * Fade in with spring
   */
  fadeIn(element: HTMLElement, config?: SpringConfig): () => void {
    element.style.opacity = '0';
    return this.animateSpring(element, 'opacity', 0, 1, config || SpringPresets.gentle);
  }

  /**
   * Fade out with spring
   */
  fadeOut(element: HTMLElement, config?: SpringConfig): () => void {
    return this.animateSpring(element, 'opacity', 1, 0, config || SpringPresets.gentle);
  }

  /**
   * Slide in from direction
   */
  slideIn(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down' = 'left',
    distance: number = 100,
    config?: SpringConfig
  ): () => void {
    const property = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
    const from = direction === 'right' || direction === 'down' ? distance : -distance;
    
    return this.animateSpring(element, property, from, 0, config || SpringPresets.default);
  }

  /**
   * Scale with spring
   */
  scale(element: HTMLElement, from: number, to: number, config?: SpringConfig): () => void {
    return this.animateSpring(element, 'scale', from, to, config || SpringPresets.bouncy);
  }

  /**
   * Spring transition for route changes
   */
  pageTransition(
    exitElement: HTMLElement,
    enterElement: HTMLElement,
    direction: 'forward' | 'backward' = 'forward'
  ): void {
    const slideDistance = 100;
    
    // Exit animation
    this.animateSpring(
      exitElement,
      'translateX',
      0,
      direction === 'forward' ? -slideDistance : slideDistance,
      SpringPresets.snappy
    );
    this.animateSpring(exitElement, 'opacity', 1, 0, SpringPresets.gentle);
    
    // Enter animation (delayed slightly)
    enterElement.style.opacity = '0';
    setTimeout(() => {
      this.animateSpring(
        enterElement,
        'translateX',
        direction === 'forward' ? slideDistance : -slideDistance,
        0,
        SpringPresets.default
      );
      this.animateSpring(enterElement, 'opacity', 0, 1, SpringPresets.gentle);
    }, 50);
  }

  /**
   * Continuous flow for lists
   */
  staggerIn(
    elements: HTMLElement[],
    config?: SpringConfig,
    staggerDelay: number = 50
  ): () => void {
    const cancelers: Array<() => void> = [];
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        const cancel1 = this.animateSpring(
          element,
          'opacity',
          0,
          1,
          config || SpringPresets.gentle
        );
        const cancel2 = this.animateSpring(
          element,
          'translateY',
          20,
          0,
          config || SpringPresets.default
        );
        
        cancelers.push(cancel1, cancel2);
      }, index * staggerDelay);
    });
    
    // Return function to cancel all animations
    return () => {
      cancelers.forEach(cancel => cancel());
    };
  }

  /**
   * Elastic bounce effect
   */
  bounce(element: HTMLElement): void {
    const keyframes = [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.1)', offset: 0.3 },
      { transform: 'scale(0.95)', offset: 0.6 },
      { transform: 'scale(1.02)', offset: 0.8 },
      { transform: 'scale(1)', offset: 1 }
    ];
    
    element.animate(keyframes, {
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    });
  }

  /**
   * Smooth scroll with spring physics
   */
  smoothScroll(element: HTMLElement, targetY: number, config?: SpringConfig): () => void {
    const startY = element.scrollTop;
    return this.animateSpring(
      element,
      'scrollTop',
      startY,
      targetY,
      config || SpringPresets.gentle,
      {
        onComplete: () => {
          element.scrollTop = targetY;
        }
      }
    );
  }
}

// Export singleton instance
export const springAnimation = new SpringAnimationEngine();

/**
 * React hook for spring animations
 */
import { useEffect, useRef } from 'react';

export function useSpringAnimation(
  trigger: boolean,
  animationType: 'fadeIn' | 'slideIn' | 'scale' | 'bounce',
  config?: SpringConfig
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !trigger) return;

    let cancel: (() => void) | undefined;

    switch (animationType) {
      case 'fadeIn':
        cancel = springAnimation.fadeIn(element, config);
        break;
      case 'slideIn':
        cancel = springAnimation.slideIn(element, 'left', 100, config);
        break;
      case 'scale':
        cancel = springAnimation.scale(element, 0.8, 1, config);
        break;
      case 'bounce':
        springAnimation.bounce(element);
        break;
    }

    return () => {
      cancel?.();
    };
  }, [trigger, animationType, config]);

  return elementRef;
}

/**
 * Hook for page transitions
 */
export function usePageTransition(isEntering: boolean) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isEntering) {
      element.style.opacity = '0';
      element.style.transform = 'translateX(50px)';
      
      const cancel1 = springAnimation.animateSpring(
        element,
        'opacity',
        0,
        1,
        SpringPresets.gentle
      );
      const cancel2 = springAnimation.animateSpring(
        element,
        'translateX',
        50,
        0,
        SpringPresets.default
      );

      return () => {
        cancel1();
        cancel2();
      };
    }
  }, [isEntering]);

  return elementRef;
}
