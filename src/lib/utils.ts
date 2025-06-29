import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// for when you can't figure out how to combine classnames yourself
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 