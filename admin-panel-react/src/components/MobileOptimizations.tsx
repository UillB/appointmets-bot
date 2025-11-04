import React, { useEffect, useState } from 'react';

// Mobile-specific optimizations and utilities
export const useMobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
      setIsTouchDevice(isTouch);
      setViewportHeight(window.innerHeight);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return {
    isMobile,
    isTouchDevice,
    viewportHeight,
    isSmallScreen: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  };
};

// Mobile-optimized touch interactions
export const useTouchOptimizations = () => {
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (Math.abs(deltaY) > minSwipeDistance) {
        onSwipe?.(deltaY > 0 ? 'up' : 'down');
      }
    } else {
      if (Math.abs(deltaX) > minSwipeDistance) {
        onSwipe?.(deltaX > 0 ? 'left' : 'right');
      }
    }
  };

  return {
    handleTouchStart,
    handleTouchEnd
  };
};

// Mobile-optimized viewport handling
export const useViewportOptimizations = () => {
  useEffect(() => {
    // Prevent zoom on input focus (iOS Safari)
    const preventZoom = (e: Event) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      }
    };

    // Restore zoom capability when input loses focus
    const restoreZoom = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    };

    document.addEventListener('focusin', preventZoom);
    document.addEventListener('focusout', restoreZoom);

    return () => {
      document.removeEventListener('focusin', preventZoom);
      document.removeEventListener('focusout', restoreZoom);
    };
  }, []);
};

// Mobile-optimized scrolling
export const useScrollOptimizations = () => {
  useEffect(() => {
    // Smooth scrolling for mobile
    const smoothScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 0) {
        target.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    };

    // Add momentum scrolling for iOS
    const addMomentumScrolling = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-overflow-scrolling: touch;
        }
      `;
      document.head.appendChild(style);
    };

    addMomentumScrolling();

    return () => {
      const style = document.querySelector('style');
      if (style && style.textContent?.includes('-webkit-overflow-scrolling')) {
        style.remove();
      }
    };
  }, []);
};

// Mobile-optimized performance
export const usePerformanceOptimizations = () => {
  useEffect(() => {
    // Reduce animations on low-end devices
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    if (prefersReducedMotion || isLowEndDevice) {
      const style = document.createElement('style');
      style.textContent = `
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Optimize images for mobile
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
    };

    optimizeImages();

    // Use intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => observer.observe(img));

    return () => {
      observer.disconnect();
    };
  }, []);
};

// Mobile-optimized keyboard handling
export const useKeyboardOptimizations = () => {
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Handle virtual keyboard on mobile
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        const nextInput = (e.target as HTMLElement).nextElementSibling as HTMLInputElement;
        if (nextInput && nextInput.tagName === 'INPUT') {
          nextInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, []);
};

// Mobile-optimized component wrapper
export const MobileOptimizedWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { isMobile, isTouchDevice } = useMobileOptimizations();
  
  useViewportOptimizations();
  useScrollOptimizations();
  usePerformanceOptimizations();
  useKeyboardOptimizations();

  return (
    <div 
      className={`${className} ${isMobile ? 'mobile-optimized' : ''} ${isTouchDevice ? 'touch-optimized' : ''}`}
      style={{
        minHeight: isMobile ? '100dvh' : 'auto', // Dynamic viewport height for mobile
      }}
    >
      {children}
    </div>
  );
};

// Mobile-optimized button component
export const MobileButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const { isMobile, isTouchDevice } = useMobileOptimizations();
  
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeClasses = {
    sm: isMobile ? 'h-10 px-4 text-sm' : 'h-9 px-3 text-sm',
    md: isMobile ? 'h-12 px-6 text-base' : 'h-10 px-4 py-2',
    lg: isMobile ? 'h-14 px-8 text-lg' : 'h-11 px-8'
  };
  
  const touchClasses = isTouchDevice ? 'touch-manipulation select-none' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${touchClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: isMobile ? '44px' : 'auto', // iOS touch target minimum
        minWidth: isMobile ? '44px' : 'auto',
      }}
    >
      {children}
    </button>
  );
};

// Mobile-optimized input component
export const MobileInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false 
}) => {
  const { isMobile } = useMobileOptimizations();
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        isMobile ? 'text-base' : 'text-sm'
      } ${className}`}
      style={{
        fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
      }}
    />
  );
};
