import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      data-slot='skeleton'
      className={cn('rounded-md bg-accent', className)}
      animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 1.4, ease: 'easeInOut', repeat: Infinity }
      }
      {...(props as HTMLMotionProps<'div'>)}
    />
  )
}

export { Skeleton }
