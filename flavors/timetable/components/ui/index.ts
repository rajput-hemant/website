/*
 * Server-safe primitives. Base UI wrappers (Dialog, Popover, SegmentedControl,
 * Slider, Switch) are imported by path so their client code and floating-ui
 * stay in the lazy chunks that use them.
 */
export { ArrowLink, type ArrowLinkProps } from "./arrow-link";
export {
  Button,
  IconButton,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type IconButtonProps,
} from "./button";
export { Container, type ContainerProps } from "./container";
export { Disclosure, type DisclosureProps } from "./disclosure";
export { ExternalLink, type ExternalLinkProps } from "./external-link";
export { FlapText, type FlapTextProps } from "./flap-text";
export { Kbd, type KbdProps } from "./kbd";
export { LineBadge, type LineBadgeProps } from "./line-badge";
export { MetaList, type MetaListItem, type MetaListProps } from "./meta-list";
export { PageHeader, type PageHeaderProps } from "./page-header";
export { RichText, type RichTextProps } from "./rich-text";
export { Section, type SectionProps } from "./section";
export { SectionHead, type SectionHeadProps } from "./section-head";
export { Tag, type TagProps } from "./tag";
export { VisuallyHidden, type VisuallyHiddenProps } from "./visually-hidden";

export {
  SplitHeading,
  type SplitHeadingProps,
} from "@/flavors/timetable/components/motion/split-heading";
