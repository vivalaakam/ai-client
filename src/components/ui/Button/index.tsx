import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'green' | 'blue' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends Omit<AntButtonProps, 'type' | 'size' | 'variant'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonProps) {
  const danger = variant === 'danger';
  const type =
    variant === 'primary' || variant === 'green' || variant === 'blue' ? 'primary' : 'default';
  const antSize = size === 'sm' ? 'small' : 'middle';

  return (
    <AntButton className={className} danger={danger} size={antSize} type={type} {...props}>
      {children}
    </AntButton>
  );
}
