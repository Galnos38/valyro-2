import { useCountUp } from '@/hooks/useCountUp';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  animate?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 55) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function ScoreGauge({ score, size = 160, animate = true }: ScoreGaugeProps) {
  const display = useCountUp(animate ? score : 0, 1000);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const stroke = 12;
  const offset = circumference - (display / 100) * circumference * 0.75;
  const color = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {display}
        </span>
        <span className="text-xs text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}
