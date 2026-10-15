import { ChartColumn, ClipboardList, Flame, Gauge, Layers, NotebookPen, Sparkles, Timer, Zap } from "lucide-react";

const ICONS = { zap: Zap, gauge: Gauge, layers: Layers, timer: Timer, sparkles: Sparkles, flame: Flame, chart: ChartColumn, notebook: NotebookPen, report: ClipboardList };

export function ToolIcon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
