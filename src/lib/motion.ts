import type { Transition, Variants } from 'framer-motion'

export const feedbackTransition: Transition = {
  duration: 0.18,
  ease: 'easeOut',
}

const entranceTransition: Transition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
}

export const dashboardItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...entranceTransition, delay },
  }),
}

export function getMotionState(reduceMotion: boolean | null) {
  return reduceMotion
    ? { initial: false as const, animate: 'visible', exit: undefined }
    : { initial: 'hidden', animate: 'visible', exit: 'exit' }
}
