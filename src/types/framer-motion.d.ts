declare module "framer-motion" {
  import type { FC, HTMLAttributes, ReactNode } from "react";

  type MotionProps = HTMLAttributes<HTMLElement> & {
    layout?: boolean;
    initial?: object;
    animate?: object;
    exit?: object;
    whileInView?: object;
    viewport?: object;
    transition?: object;
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
