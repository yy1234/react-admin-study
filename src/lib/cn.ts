import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并条件 className，并让后面的 Tailwind 工具类覆盖前面的冲突类。  
// clsx：负责处理条件 class
// twMerge：负责解决 Tailwind class 冲突
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
