declare module "framer-motion" {
  import type { FC, HTMLAttributes, React, ReactNode } from "react";

  type MotionProps = HTMLAttributes<HTMLElement> & {
    ref?: React.Ref<HTMLElement>;
    layout?: boolean;
    initial?: object;
    animate?: object;
    exit?: object;
    whileInView?: object;
    viewport?: object;
    transition?: object;
    role?: string;
    "aria-modal"?: boolean | "true" | "false";
    "aria-labelledby"?: string;
    "aria-label"?: string;
    type?: string;
  };

  type MotionComponent = FC<MotionProps>;

  export const motion: Record<string, MotionComponent> & {
    article: MotionComponent;
    aside: MotionComponent;
    blockquote: MotionComponent;
    div: MotionComponent;
    nav: MotionComponent;
  };

  export const AnimatePresence: FC<{
    children?: ReactNode;
    mode?: "sync" | "wait" | "popLayout";
  }>;
}
