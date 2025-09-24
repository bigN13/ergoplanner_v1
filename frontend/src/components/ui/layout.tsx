import React from "react";

import { cn } from "@/utils/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = "2xl",
  ...props
}) => {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth], className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "bordered" | "elevated";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "default",
  ...props
}) => {
  const variants = {
    default: "bg-white",
    bordered: "bg-white border border-gray-200",
    elevated: "bg-white shadow-lg",
  };

  return (
    <div className={cn("rounded-lg p-6", variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

export const Stack: React.FC<StackProps> = ({
  children,
  className,
  direction = "vertical",
  spacing = "md",
  align = "stretch",
  justify = "start",
  ...props
}) => {
  const directionClasses = {
    horizontal: "flex-row",
    vertical: "flex-col",
  };

  const spacingClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
