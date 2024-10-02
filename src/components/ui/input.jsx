import * as React from "react";

import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
           "flex h-10 w-full rounded-md border border-[#fedfa1] bg-[#272933] px-3 py-2 text-sm text-[#fff] ring-offset-[#272933] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#a3b3cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fedfa1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
