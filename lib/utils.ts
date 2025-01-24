import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

interface QualityReport {
  score: number;
  reason: string;
  processed_at: number;
}

export function getQualityBadgeProps(score: number | null) {
  if (score === null) {
    return {
      score: 0.0,
      variant: 'nodata' as const,
      label: 'No Data'
    };
  }

  if (score === 0) {
    return {
      score: 0,
      variant: 'outline' as const,
      label: 'No Data'
    };
  }

  if (score >= 8) {
    return {
      score: score,
      variant: 'default' as const,
      label: 'Excellent'
    };
  } else if (score >= 6) {
    return {
      score: score,
      variant: 'secondary' as const,
      label: 'Good'
    };
  } else {
    return {
      score: score,
      variant: 'destructive' as const,
      label: 'Bad'
    };
  }
}
