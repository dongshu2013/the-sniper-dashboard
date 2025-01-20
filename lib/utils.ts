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

export function getQualityBadgeProps(reports: QualityReport[] | null) {
  if (!reports || reports.length === 0) {
    return {
      score: 0.0,
      variant: 'nodata' as const,
      label: 'No Data'
    };
  }

  const avgScore =
    reports.reduce((sum, report) => sum + report.score, 0) / reports.length;

  if (avgScore >= 8) {
    return {
      score: avgScore,
      variant: 'default' as const,
      label: 'Excellent'
    };
  } else if (avgScore >= 6) {
    return {
      score: avgScore,
      variant: 'secondary' as const,
      label: 'Good'
    };
  } else {
    return {
      score: avgScore,
      variant: 'destructive' as const,
      label: 'Bad'
    };
  }
}
