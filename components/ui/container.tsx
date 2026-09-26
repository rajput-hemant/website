import * as React from "react";

import { cn } from "@/lib/utils";

type ContainerOwnProps = { className?: string; children: React.ReactNode };

export type ContainerProps<T extends React.ElementType = "div"> =
  ContainerOwnProps & {
    as?: T;
  } & Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerOwnProps | "as">;

/** The 12-col editorial grid's max-width wrapper. */
export function Container<T extends React.ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as React.ElementType;
  return React.createElement(
    Tag,
    { className: cn("mx-auto max-w-[88rem] px-gutter", className), ...props },
    children
  );
}
