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
export { Callout, type CalloutProps } from "./callout";
export { CatalogueNumber, type CatalogueNumberProps } from "./catalogue-number";
export { Container, type ContainerProps } from "./container";
export { DateStamp, type DateStampProps } from "./date-stamp";
export { Dimension, type DimensionProps } from "./dimension";
export { Disclosure, type DisclosureProps } from "./disclosure";
export { ExternalLink, type ExternalLinkProps } from "./external-link";
export { Kbd, type KbdProps } from "./kbd";
export { MetaList, type MetaListItem, type MetaListProps } from "./meta-list";
export { PageHeader, type PageHeaderProps } from "./page-header";
export { RichText, type RichTextProps } from "./rich-text";
export {
  Schedule,
  type ScheduleColumn,
  type ScheduleProps,
  type ScheduleRow,
} from "./schedule";
export { Section, type SectionProps } from "./section";
export { SheetHeading, type SheetHeadingProps } from "./sheet-heading";
export { Stamp, type StampProps } from "./stamp";
export { Tag, type TagProps } from "./tag";
export {
  TitleBlock,
  type TitleBlockProps,
  type TitleBlockRow,
} from "./title-block";
export { VisuallyHidden, type VisuallyHiddenProps } from "./visually-hidden";

export {
  Reveal,
  type RevealProps,
} from "@/flavors/drawing-set/components/motion/reveal";
export {
  SplitHeading,
  type SplitHeadingProps,
} from "@/flavors/drawing-set/components/motion/split-heading";
