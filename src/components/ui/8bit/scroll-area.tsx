import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative flex flex-col", className)}
      {...props}
    >
      {/* Viewport sized via flex-grow (min-h-0 flex-1), not `size-full`.
       * `height: 100%` can't resolve here — this Root's own height, while
       * correctly bounded on screen by flex-grow inside a `max-h` Drawer
       * column, is never a CSS "definite" size (that requires the whole
       * flex ancestor chain up to a definite-height box, which the
       * `h-auto` + `max-height` Drawer never has). `height: 100%` then
       * resolves to `auto`, so the Viewport grows to its content's full
       * height instead of the available space, and Root's `overflow:
       * hidden` silently clips the rest instead of it ever scrolling.
       * Flex-grow sizing isn't subject to that percentage-resolution
       * rule, so it reaches the actually-bounded height. */}
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 min-h-0 min-w-0 flex-1 rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none bg-foreground/30 dark:bg-ring/30 relative",
        orientation === "vertical" &&
          "h-full w-1.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-1.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative dark:bg-ring rounded-none  flex-1 bg-foreground transition-none duration-75",
          orientation === "vertical" && "scale-x-250 ",
          orientation === "horizontal" && "scale-y-250 "
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
