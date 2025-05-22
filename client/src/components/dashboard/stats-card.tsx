import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  percentage: number;
  progress: number;
  progressColor?: string;
}

export function StatsCard({
  title,
  value,
  subtext,
  percentage,
  progress,
  progressColor = "bg-primary"
}: StatsCardProps) {
  const isPositive = percentage >= 0;
  
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={cn(
          "rounded-full px-2 py-1 text-xs",
          isPositive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        )}>
          {isPositive ? "+" : ""}{percentage}%
        </span>
      </div>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        <span className="ml-2 text-sm text-gray-600">{subtext}</span>
      </div>
      <div className="mt-4">
        <div className="chart-bar">
          <div 
            className={cn("chart-bar-fill", progressColor)} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
