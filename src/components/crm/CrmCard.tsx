import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CrmCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const CrmCard = React.forwardRef<HTMLDivElement, CrmCardProps>(
  ({ className, hover = true, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground p-5',
        hover && 'transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]',
        className
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
);
CrmCard.displayName = 'CrmCard';

export default CrmCard;
