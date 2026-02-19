import { BarChart3 } from 'lucide-react';
import { useTheme } from '../theme.jsx';

export default function AnalyticsPage() {
  const { t } = useTheme();

  return (
    <div className="flex-1 flex flex-col items-center justify-center" style={{ background: t.bg.secondary }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: t.bg.tertiary }}>
        <BarChart3 size={24} style={{ color: t.text.tertiary }} />
      </div>
      <h1 className="text-2xl font-bold" style={{ color: t.text.primary }}>Analytics</h1>
      <p className="text-sm mt-2 font-medium" style={{ color: t.text.secondary }}>Coming Soon</p>
      <p className="text-xs mt-1 max-w-md text-center" style={{ color: t.text.tertiary }}>
        Performance dashboards, ROI tracking, and portfolio insights.
      </p>
    </div>
  );
}
