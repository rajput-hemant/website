import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

type ContainerOwnProps = { className?: string; children: React.ReactNode };

export type ContainerProps<T extends React.ElementType = "div"> =
  ContainerOwnProps & {
    as?: T;
  } & Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerOwnProps | "as">;

/** The sheet's width: the neat lines of a 1440px map face. */
export function Container<T extends React.ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  return React.createElement(
    (as ?? "div") as React.ElementType,
    { className: cn("mx-auto max-w-[90rem] px-gutter", className), ...props },
    children
  );
}
