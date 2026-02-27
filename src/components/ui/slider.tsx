import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group cursor-pointer",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/60 group-hover:bg-secondary transition-colors duration-200">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary/80" />
    </SliderPrimitive.Track>
    {/* Render thumb for each value (supports range sliders) */}
    {(props.value || props.defaultValue || [0]).map((_, index) => (
      <SliderPrimitive.Thumb 
        key={index}
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-lg ring-offset-background transition-all duration-200 
          hover:scale-110 hover:border-primary/80 hover:shadow-primary/30 hover:shadow-xl
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:scale-110
          active:scale-95 active:shadow-md
          disabled:pointer-events-none disabled:opacity-50
          before:absolute before:inset-0 before:rounded-full before:bg-primary/10 before:scale-0 before:transition-transform before:duration-200
          hover:before:scale-150 focus-visible:before:scale-150" 
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
