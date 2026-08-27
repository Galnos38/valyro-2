import type { PricePoint } from '@/types';

interface PriceChartProps {
  data: PricePoint[];
  currentPrice: number;
}

export function PriceChart({ data, currentPrice }: PriceChartProps) {
  if (data.length < 2) return null;
  const prices = data.map((d) => d.price);
  const max = Math.max(...prices) * 1.05;
  const min = Math.min(...prices) * 0.95;
  const range = max - min || 1;

  const width = 320;
  const height = 120;
  const padX = 8;
  const padY = 12;
  const stepX = (width - padX * 2) / (data.length - 1);

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + (1 - (d.price - min) / range) * (height - padY * 2),
  price: d.price,
    date: d.date,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const lastIdx = data.length - 1;
  const isLow = data[lastIdx].price <= data[0].price;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isLow ? '#10b981' : '#f59e0b'} stopOpacity="0.35" />
            <stop offset="100%" stopColor={isLow ? '#10b981' : '#f59e0b'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#priceGrad)" />
        <path d={linePath} fill="none" stroke={isLow ? '#10b981' : '#f59e0b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === lastIdx ? 4 : 2} fill={isLow ? '#10b981' : '#f59e0b'} />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-slate-500 px-2">
        <span>{data[0].date}</span>
        <span className="text-slate-300 font-medium">
          Actuel: {currentPrice.toLocaleString('fr-FR')} €
        </span>
        <span>{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}
