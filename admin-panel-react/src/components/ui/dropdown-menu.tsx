"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

// Context for dropdown state
interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu");
  }
  return context;
}

// Root component
interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function DropdownMenu({ open: controlledOpen, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  const contextValue = React.useMemo<DropdownMenuContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      contentRef,
    }),
    [open, setOpen]
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

// Portal component (for rendering dropdown in document body)
function DropdownMenuPortal({ children, ...props }: { children?: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !children) return null;

  return createPortal(children, document.body);
}

// Trigger component
interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownMenuContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open);
      onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref: (node: HTMLElement) => {
          triggerRef.current = node;
          if (typeof ref === "function") {
            ref(node as HTMLButtonElement);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node as HTMLButtonElement;
          }
        },
        onClick: handleClick,
        "aria-expanded": open,
        "aria-haspopup": "menu",
      });
    }

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
        }}
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup="menu"
        data-slot="dropdown-menu-trigger"
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// Content component with positioning
interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
  onCloseAutoFocus?: (event: Event) => void;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", sideOffset = 4, onCloseAutoFocus, children, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentRef } = useDropdownMenuContext();
    const [position, setPosition] = React.useState<{ top: number; left: number; transformOrigin: string } | null>(null);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Calculate initial position synchronously before paint (useLayoutEffect)
    React.useLayoutEffect(() => {
      if (!open || !triggerRef.current) {
        if (!open) {
          setPosition(null);
          setIsAnimating(false);
        }
        return;
      }

      // Calculate initial position estimate immediately (before content is rendered)
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;
      
      // Estimate content width (use min-width as fallback)
      const estimatedContentWidth = 128; // min-w-[8rem] = 128px
      
      let left = triggerRect.left;
      let top = triggerRect.bottom + sideOffset;
      let transformOrigin = "top left";

      // Calculate horizontal alignment based on align prop
      if (align === "end") {
        left = triggerRect.right - estimatedContentWidth;
        transformOrigin = "top right";
      } else if (align === "center") {
        left = triggerRect.left + (triggerRect.width - estimatedContentWidth) / 2;
        transformOrigin = "top center";
      }

      // Adjust horizontal position to keep within viewport
      if (left < padding) {
        left = padding;
        transformOrigin = "top left";
      } else if (left + estimatedContentWidth > viewportWidth - padding) {
        left = viewportWidth - estimatedContentWidth - padding;
        if (left < padding) left = padding;
        transformOrigin = "top left";
      }

      // Set initial position immediately (before paint)
      setPosition({ top, left, transformOrigin });
      setIsAnimating(true);
    }, [open, align, sideOffset, triggerRef]);

    // Refine position once content is rendered and measured
    React.useEffect(() => {
      if (!open || !triggerRef.current || !contentRef.current) return;

      const updatePosition = () => {
        if (!triggerRef.current || !contentRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 8;

        // For position: fixed, use viewport coordinates (no scroll offset)
        let left = triggerRect.left;
        let top = triggerRect.bottom + sideOffset;
        let transformOrigin = "top left";

        // Calculate horizontal alignment based on align prop
        if (align === "end") {
          // Right-align: dropdown's right edge aligns with trigger's right edge
          left = triggerRect.right - contentRect.width;
          transformOrigin = "top right";
        } else if (align === "center") {
          // Center-align: dropdown is centered relative to trigger
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
          transformOrigin = "top center";
        } else {
          // "start" (default): left-align: dropdown's left edge aligns with trigger's left edge
          left = triggerRect.left;
          transformOrigin = "top left";
        }

        // Adjust horizontal position to keep within viewport
        if (left < padding) {
          left = padding;
          transformOrigin = "top left";
        } else if (left + contentRect.width > viewportWidth - padding) {
          left = viewportWidth - contentRect.width - padding;
          if (left < padding) {
            left = padding;
          }
          transformOrigin = "top right";
        }

        // Check if there's enough space below, otherwise flip to top
        const spaceBelow = viewportHeight - triggerRect.bottom - sideOffset;
        const spaceAbove = triggerRect.top - sideOffset;
        
        if (spaceBelow < contentRect.height && spaceAbove > spaceBelow) {
          // Flip to top
          top = triggerRect.top - contentRect.height - sideOffset;
          transformOrigin = transformOrigin.replace("top", "bottom");
        }

        // Ensure vertical position stays within viewport
        if (top < padding) {
          top = padding;
        } else if (top + contentRect.height > viewportHeight - padding) {
          top = viewportHeight - contentRect.height - padding;
          if (top < padding) {
            top = padding;
          }
        }

        setPosition({ top, left, transformOrigin });
      };

      // Use requestAnimationFrame to ensure content is rendered and measured
      const rafId = requestAnimationFrame(() => {
        updatePosition();
      });

      const handleResize = () => {
        requestAnimationFrame(updatePosition);
      };
      
      const handleScroll = () => {
        requestAnimationFrame(updatePosition);
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }, [open, align, sideOffset, triggerRef, contentRef]);

    // Handle close animation
    React.useEffect(() => {
      if (!open) {
        const timer = setTimeout(() => {
          setPosition(null);
          setIsAnimating(false);
        }, 200); // Match animation duration
        return () => clearTimeout(timer);
      }
    }, [open]);

    if (!open && !isAnimating) return null;
    
    // Don't render until we have a position (prevents flash in top-left corner)
    if (open && !position) return null;

    const content = (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        data-slot="dropdown-menu-content"
        className={cn(
          // Base styles
          "fixed z-[10000] max-h-[300px] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md p-1 shadow-lg",
          // Background and text colors with dark mode support
          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
          // Border with dark mode support
          "border border-gray-200 dark:border-gray-800",
          // Animation
          open ? "animate-in fade-in-0 zoom-in-95" : "animate-out fade-out-0 zoom-out-95",
          className
        )}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          transformOrigin: position?.transformOrigin ?? "top left",
          transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0.95)",
          pointerEvents: open ? "auto" : "none",
        }}
        role="menu"
        aria-hidden={!open}
        {...props}
      >
        {children}
      </div>
    );

    return <DropdownMenuPortal>{content}</DropdownMenuPortal>;
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";

// Group component
function DropdownMenuGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-group" className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

// Item component
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: "default" | "destructive";
  onSelect?: (event: Event) => void;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, variant = "default", onSelect, onClick, children, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (onSelect) {
        onSelect(e.nativeEvent);
      }
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick(e as any);
      }
    };

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-item"
        data-inset={inset}
        data-variant={variant}
        role="menuitem"
        tabIndex={0}
        className={cn(
          // Base styles
          "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
          // Text colors with dark mode support
          "text-gray-900 dark:text-gray-100",
          // Hover and focus states with dark mode support
          "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
          // Destructive variant styles with dark mode support
          variant === "destructive" && "text-red-600 dark:text-red-400",
          variant === "destructive" && "hover:bg-red-50 dark:hover:bg-red-950/30",
          variant === "destructive" && "focus:bg-red-50 dark:focus:bg-red-950/30",
          // Icon styles
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          // Inset variant
          inset && "pl-8",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";

// Checkbox item component
interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, checked, onCheckedChange, children, ...props }, ref) => {
    const handleClick = () => {
      onCheckedChange?.(!checked);
    };

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-checkbox-item"
        role="menuitemcheckbox"
        aria-checked={checked}
        tabIndex={0}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none",
          "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          {checked && (
            <CheckIcon className="size-4" />
          )}
        </span>
        {children}
      </div>
    );
  }
);

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// Radio group component
function DropdownMenuRadioGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="dropdown-menu-radio-group" role="radiogroup" className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

// Radio item component
interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  checked?: boolean;
  onSelect?: (value: string) => void;
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, value, checked, onSelect, children, ...props }, ref) => {
    const handleClick = () => {
      if (value && onSelect) {
        onSelect(value);
      }
    };

    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-radio-item"
        role="menuitemradio"
        aria-checked={checked}
        tabIndex={0}
        className={cn(
          "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none",
          "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          {checked && (
            <CircleIcon className="size-2 fill-current" />
          )}
        </span>
        {children}
      </div>
    );
  }
);

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

// Label component
interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-label"
        data-inset={inset}
        className={cn(
          "px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100",
          inset && "pl-8",
          className
        )}
        {...props}
      />
    );
  }
);

DropdownMenuLabel.displayName = "DropdownMenuLabel";

// Separator component
const DropdownMenuSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        data-slot="dropdown-menu-separator"
        className={cn("bg-gray-200 dark:bg-gray-800 -mx-1 my-1 h-px border-0", className)}
        {...props}
      />
    );
  }
);

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// Shortcut component
const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="dropdown-menu-shortcut"
        className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
        {...props}
      />
    );
  }
);

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Sub menu components (simplified - can be enhanced later)
function DropdownMenuSub({ children, ...props }: { children: React.ReactNode }) {
  return <div data-slot="dropdown-menu-sub" {...props}>{children}</div>;
}

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-sub-trigger"
        data-inset={inset}
        className={cn(
          "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
          "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
        <ChevronRightIcon className="ml-auto size-4" />
      </div>
    );
  }
);

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
}

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ className, align, ...props }, ref) => {
    // Simplified sub-content - can be enhanced with positioning later
    return (
      <div
        ref={ref}
        data-slot="dropdown-menu-sub-content"
        className={cn(
          "z-[10000] min-w-[8rem] overflow-hidden rounded-md p-1 shadow-lg",
          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
          "border border-gray-200 dark:border-gray-800",
          className
        )}
        {...props}
      />
    );
  }
);

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
