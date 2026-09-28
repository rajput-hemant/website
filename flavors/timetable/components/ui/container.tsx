import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

type ContainerOwnProps = { className?: string; children: React.ReactNode };

export type ContainerProps<T extends React.ElementType = "div"> =
  ContainerOwnProps & {
    as?: T;
  } & Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerOwnProps | "as">;

/** The concourse width: the same 12 columns as the sign band. */
export function Container<T extends React.ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as React.ElementType;
  return React.createElement(
    Tag,
    { className: cn("mx-auto max-w-[100rem] px-gutter", className), ...props },
    children
  );
}
