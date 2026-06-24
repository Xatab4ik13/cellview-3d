import { forwardRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import type { InputHTMLAttributes } from 'react';

/**
 * Маска для российского телефона: +7 (XXX) XXX-XX-XX
 * При фокусе автоматически подставляется "+7 (".
 */
function formatRu(raw: string): string {
  // Берём только цифры
  let digits = raw.replace(/\D/g, '');
  // Если начинается с 8 или 7 — отбрасываем (мы сами добавим +7)
  if (digits.startsWith('8')) digits = digits.slice(1);
  else if (digits.startsWith('7')) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  let out = '+7';
  if (digits.length === 0) return '+7 (';
  out += ' (' + digits.slice(0, 3);
  if (digits.length >= 3) out += ')';
  if (digits.length > 3) out += ' ' + digits.slice(3, 6);
  if (digits.length > 6) out += '-' + digits.slice(6, 8);
  if (digits.length > 8) out += '-' + digits.slice(8, 10);
  return out;
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'type'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export const PhoneInput = forwardRef<HTMLInputElement, Props>(
  ({ value, defaultValue, onValueChange, onFocus, onBlur, name, placeholder, ...rest }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatRu(e.target.value);
        e.target.value = formatted;
        onValueChange?.(formatted);
      },
      [onValueChange]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (!e.target.value || e.target.value.replace(/\D/g, '') === '') {
          e.target.value = '+7 (';
        }
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '+7 (' || e.target.value === '+7') {
          e.target.value = '';
        }
        onBlur?.(e);
      },
      [onBlur]
    );

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        name={name}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder || '+7 (___) ___-__-__'}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
    );
  }
);
PhoneInput.displayName = 'PhoneInput';
