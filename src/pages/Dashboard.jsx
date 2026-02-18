import {
  TrendingDown, FileText, Star, AlertTriangle, Check, Sparkles,
  BarChart3, TrendingUp, Building, Calendar, ChevronLeft, ChevronRight,
  Clock,
} from 'lucide-react';
import { useTheme } from '../theme.jsx';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Active Deals', value: '8', change: '+2 this week', semantic: 'success' },
  { label: 'Pipeline Value', value: '$4.2M', change: '+12%', semantic: 'success' },
  { label: 'Buy Box Matches', value: '14', change: '3 new today', semantic: 'accent' },
];

const FEED_ITEMS = [
  { icon: TrendingDown, semantic: 'error', title: 'Price Drop Alert', desc: '1200 Main St dropped 12% to $2.4M', time: '2m' },
  { icon: FileText, semantic: 'success', title: 'Deal Update', desc: 'Westfield Plaza moved to Due Diligence', time: '15m' },
  { icon: Star, semantic: 'warning', title: 'Buy Box Match', desc: '3 new parcels match your Industrial buy box', time: '1h' },
  { icon: AlertTriangle, semantic: 'warning', title: 'Market Alert', desc: 'Cap rates rising in Downtown submarket', time: '2h' },
  { icon: Check, semantic: 'success', title: 'Deal Closed', desc: 'Harbor View Apartments - $5.2M', time: '3h' },
  { icon: Sparkles, semantic: 'accent', title: 'AI Insight', desc: 'Scout found 8 distressed assets matching your criteria', time: '4h' },
  { icon: Star, semantic: 'warning', title: 'Property Sold', desc: 'Oakwood Center removed from watchlist', time: '5h' },
];

const TASKS = [
  { semantic: 'error', text: 'Send LOI to Cameron Rd owner', due: 'by 5pm' },
  { semantic: 'warning', text: 'Review proforma — Pflugerville', due: 'by EOD' },
  { semantic: 'accent', text: 'Prep Sequoia deck updates', due: 'by Wed' },
];

const INSIGHTS = [
  {
    icon: BarChart3,
    tag: 'Market Report',
    tagSemantic: 'accent',
    date: 'Jan 28, 2025',
    headline: 'Q4 2024 Industrial Market Overview',
    body: 'Industrial vacancy rates hit historic lows at 3.2% while asking rents increased 8.5% YoY...',
    aiText: 'Based on current trends, expect 5-7% rent growth in Class A industrial through Q2 2025. Focus on infill locations near...',
    readTime: '5 min read',
  },
  {
    icon: TrendingUp,
    tag: 'Investment Analysis',
    tagSemantic: 'purple',
    date: 'Jan 26, 2025',
    headline: 'Multifamily Cap Rate Trends',
    body: 'Cap rates expanded 25-50 bps across major metros as interest rates stabilized. Value-add opportunities...',
    aiText: 'Properties with assumable debt at sub-5% rates trading at 10-15% premium. Consider targeting 2019-2021 vintage...',
    readTime: '5 min read',
  },
];

const INSIGHT_FULL = {
  icon: Building,
  tag: 'Market Alert',
  tagSemantic: 'accent',
  date: 'Jan 24, 2025',
  headline: 'Office-to-Residential Conversions Surge',
  body: 'Class B/C office conversions up 340% since 2022. Cities offering tax incentives driving adaptive reuse in...',
  readTime: '4 min read',
};

const TRENDING = [
  { rank: 1, rankSemantic: 'accent', name: 'Westfield Distribution Center', meta: 'Industrial \u2022 Phoenix, AZ', stat: '+24', statSemantic: 'success' },
  { rank: 2, rankSemantic: 'accent', name: 'Harbor Bay Apartments', meta: 'Multifamily \u2022 San Diego, CA', stat: '+18', statSemantic: 'success' },
  { rank: 3, rankSemantic: 'success', name: '\u201cNNN retail Austin\u201d', meta: 'Search term', stat: '142', statSemantic: 'secondary', isSearch: true },
  { rank: 4, rankSemantic: 'neutral', name: 'Oakwood Office Park', meta: 'Office \u2022 Denver, CO', stat: '+12', statSemantic: 'success' },
  { rank: 5, rankSemantic: 'success', name: '\u201cValue-add multifamily\u201d', meta: 'Search term', stat: '98', statSemantic: 'secondary', isSearch: true },
  { rank: 6, rankSemantic: 'neutral', name: 'Metro Flex Warehouse', meta: 'Industrial \u2022 Dallas, TX', stat: '+8', statSemantic: 'success' },
  { rank: 7, rankSemantic: 'success', name: '\u201cCap rate 7%+\u201d', meta: 'Search term', stat: '87', statSemantic: 'secondary', isSearch: true },
  { rank: 8, rankSemantic: 'neutral', name: 'Sunrise Medical Plaza', meta: 'Medical Office \u2022 Tampa, FL', stat: '+6', statSemantic: 'success' },
];

const EVENTS = [
  { semantic: 'accent', title: '9:00 AM \u2014 Standup', subtitle: 'Dheeraj & Arpan', duration: '30m' },
  { semantic: 'success', title: '10:30 AM \u2014 Investor Call', subtitle: 'Sequoia Scout', duration: '45m' },
  { semantic: 'purple', title: '1:00 PM \u2014 ScoutGPT v2 Demo Review', subtitle: null, duration: '1h' },
  { semantic: 'accent', title: '3:00 PM \u2014 Tom Staub \u2014 CRO Sync', subtitle: null, duration: '30m' },
  { semantic: 'purple', title: '4:00 PM \u2014 ATTOM Integration Check', subtitle: null, duration: '30m' },
];

const DEADLINES = [
  { icon: AlertTriangle, semantic: 'warning', text: 'Cameron Rd LOI expires \u2014 3 days' },
  { icon: Clock, semantic: 'tertiary', text: 'Closing docs due (Pflugerville) \u2014 5 days' },
];

// Feb 2025: starts Saturday
const CAL_WEEKS = [
  [null, null, null, null, null, null, 1],
  [2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26, 27, 28, null],
];
const CAL_TODAY = 17;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t, isDark } = useTheme();

  const colors = {
    success: t.semantic.success,
    error: t.semantic.error,
    warning: t.semantic.warning,
    accent: t.accent.primary,
    info: t.semantic.info,
    purple: t.charts.spectrum[2],
    neutral: t.text.tertiary,
    secondary: t.text.secondary,
    tertiary: t.text.tertiary,
  };

  const mutedBg = (key) =>
    key === 'accent'
      ? t.accent.primaryMuted
      : `${colors[key]}${isDark ? '26' : '1a'}`;

  return (
    <div className="flex-1 overflow-auto" style={{ background: t.bg.secondary }}>
      <div className="p-6">
        <div className="flex gap-5">
          {/* Left + Center Wrap */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Quick Stats */}
            <div className="rounded-lg border px-5 py-4" style={{ background: t.bg.primary, borderColor: t.border.default }}>
              <div className="flex items-center gap-4">
                <h2 className="text-[15px] font-bold shrink-0" style={{ color: t.text.primary }}>Quick Stats</h2>
                <div className="flex gap-3 flex-1">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex-1 rounded-md border p-3.5 flex flex-col gap-1" style={{ background: t.bg.secondary, borderColor: t.border.default }}>
                      <span className="text-[11px] font-medium" style={{ color: t.text.secondary }}>{s.label}</span>
                      <span className="text-2xl font-bold" style={{ color: t.text.primary }}>{s.value}</span>
                      <span className="text-[11px] font-medium" style={{ color: colors[s.semantic] }}>{s.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed + Insights columns */}
            <div className="flex gap-5">
              {/* Left Column — Feed & Tasks */}
              <div className="w-[260px] shrink-0">
                <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: t.bg.primary, borderColor: t.border.default }}>
                  {/* Feed header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-bold" style={{ color: t.text.primary }}>Your Feed</h2>
                      <span
                        className="text-[11px] font-semibold px-2 h-[22px] flex items-center rounded-full"
                        style={{ background: t.accent.primaryMuted, color: t.accent.primary }}
                      >
                        4 new
                      </span>
                    </div>
                    <button className="text-xs font-semibold" style={{ color: t.accent.primary }}>View All</button>
                  </div>

                  {/* Feed items */}
                  <div className="flex flex-col">
                    {FEED_ITEMS.map((item, i) => (
                      <div
                        key={i}
                        className={`flex gap-2.5 py-2.5 ${i < FEED_ITEMS.length - 1 ? 'border-b' : ''}`}
                        style={i < FEED_ITEMS.length - 1 ? { borderBottomColor: t.border.subtle } : undefined}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: mutedBg(item.semantic) }}
                        >
                          <item.icon size={14} style={{ color: colors[item.semantic] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold" style={{ color: t.text.primary }}>{item.title}</p>
                          <p className="text-xs truncate" style={{ color: t.text.secondary }}>{item.desc}</p>
                        </div>
                        <span className="text-[11px] shrink-0" style={{ color: t.text.tertiary }}>{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px" style={{ background: t.border.default }} />

                  {/* Tasks */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold" style={{ color: t.text.primary }}>Tasks</h3>
                      <span className="text-[11px] font-medium" style={{ color: t.text.secondary }}>3 due today</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {TASKS.map((task, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm border shrink-0" style={{ borderColor: t.border.strong }} />
                          <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: colors[task.semantic] }} />
                          <span className="text-xs font-medium flex-1 truncate" style={{ color: t.text.primary }}>{task.text}</span>
                          <span className="text-[11px] shrink-0" style={{ color: t.text.tertiary }}>{task.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column — Featured Insights */}
              <div className="flex-1 min-w-0">
                <div className="rounded-lg border p-5 flex flex-col gap-4" style={{ background: t.bg.primary, borderColor: t.border.default }}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-bold" style={{ color: t.text.primary }}>Featured Insights</h2>
                    <button className="text-xs font-semibold" style={{ color: t.accent.primary }}>Browse All</button>
                  </div>

                  {/* Two insight cards side by side */}
                  <div className="flex gap-4">
                    {INSIGHTS.map((card, i) => (
                      <div key={i} className="flex-1 rounded-md border overflow-hidden flex flex-col" style={{ borderColor: t.border.default }}>
                        <div className="h-[140px] flex items-center justify-center" style={{ background: t.bg.secondary }}>
                          <card.icon size={32} style={{ color: t.text.quaternary }} />
                        </div>
                        <div className="p-3.5 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[10px] font-semibold px-2 h-5 flex items-center rounded-full"
                              style={{ background: mutedBg(card.tagSemantic), color: colors[card.tagSemantic] }}
                            >
                              {card.tag}
                            </span>
                            <span className="text-[11px]" style={{ color: t.text.tertiary }}>{card.date}</span>
                          </div>
                          <h3 className="text-sm font-bold" style={{ color: t.text.primary }}>{card.headline}</h3>
                          <p className="text-xs leading-[1.4]" style={{ color: t.text.secondary }}>{card.body}</p>
                          <div className="rounded-md p-2.5 flex gap-2" style={{ background: t.accent.primaryMuted }}>
                            <Sparkles size={14} className="shrink-0 mt-0.5" style={{ color: t.accent.primary }} />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold" style={{ color: t.accent.primary }}>AI Insight</span>
                              <p className="text-[11px] leading-[1.4]" style={{ color: t.text.secondary }}>{card.aiText}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px]" style={{ color: t.text.tertiary }}>{card.readTime}</span>
                            <button className="text-xs font-semibold" style={{ color: t.accent.primary }}>Read More &rarr;</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Full-width insight card 3 */}
                  <div className="rounded-md border overflow-hidden flex flex-col" style={{ borderColor: t.border.default }}>
                    <div className="h-[140px] flex items-center justify-center" style={{ background: t.bg.secondary }}>
                      <INSIGHT_FULL.icon size={32} style={{ color: t.text.quaternary }} />
                    </div>
                    <div className="p-3.5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-semibold px-2 h-5 flex items-center rounded-full"
                          style={{ background: mutedBg(INSIGHT_FULL.tagSemantic), color: colors[INSIGHT_FULL.tagSemantic] }}
                        >
                          {INSIGHT_FULL.tag}
                        </span>
                        <span className="text-[11px]" style={{ color: t.text.tertiary }}>{INSIGHT_FULL.date}</span>
                      </div>
                      <h3 className="text-sm font-bold" style={{ color: t.text.primary }}>{INSIGHT_FULL.headline}</h3>
                      <p className="text-xs leading-[1.4]" style={{ color: t.text.secondary }}>{INSIGHT_FULL.body}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: t.text.tertiary }}>{INSIGHT_FULL.readTime}</span>
                        <button className="text-xs font-semibold" style={{ color: t.accent.primary }}>Read More &rarr;</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-[310px] shrink-0 flex flex-col gap-2">
            {/* Trending Card */}
            <div className="rounded-lg border px-5 py-3.5 flex flex-col gap-2.5" style={{ background: t.bg.primary, borderColor: t.border.default }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold" style={{ color: t.text.primary }}>Trending</h2>
                <div className="flex rounded-md border overflow-hidden" style={{ borderColor: t.border.default }}>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-[5px]"
                    style={{ background: t.text.primary, color: t.bg.primary }}
                  >
                    Properties
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1" style={{ color: t.text.secondary }}>Searches</span>
                </div>
              </div>
              <div className="flex flex-col">
                {TRENDING.map((tr) => (
                  <div key={tr.rank} className="flex items-center gap-2.5 py-[5px]">
                    <div
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
                      style={{ background: colors[tr.rankSemantic] }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: '#fff' }}>{tr.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: tr.isSearch ? colors.success : t.text.primary }}
                      >
                        {tr.name}
                      </p>
                      <p className="text-[11px]" style={{ color: t.text.secondary }}>{tr.meta}</p>
                    </div>
                    <span className="text-[11px] font-semibold shrink-0" style={{ color: colors[tr.statSemantic] }}>{tr.stat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Card */}
            <div className="rounded-lg border px-5 py-3 flex flex-col gap-2.5" style={{ background: t.bg.primary, borderColor: t.border.default }}>
              {/* Schedule Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} style={{ color: t.text.secondary }} />
                  <h2 className="text-[15px] font-bold" style={{ color: t.text.primary }}>Today &mdash; Feb 17</h2>
                </div>
                <button className="text-xs font-semibold" style={{ color: t.accent.primary }}>Full Calendar &rarr;</button>
              </div>

              {/* Mini Calendar */}
              <div className="rounded-lg border px-3.5 py-3 flex flex-col gap-2" style={{ background: t.bg.primary, borderColor: t.border.default }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ChevronLeft size={14} className="cursor-pointer" style={{ color: t.text.tertiary }} />
                    <span className="text-xs font-semibold" style={{ color: t.text.primary }}>February 2025</span>
                    <ChevronRight size={14} className="cursor-pointer" style={{ color: t.text.tertiary }} />
                  </div>
                  <span className="text-[11px] font-semibold cursor-pointer" style={{ color: t.accent.primary }}>Today</span>
                </div>
                <div className="flex">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="flex-1 text-center text-[10px] font-semibold" style={{ color: t.text.tertiary }}>{d}</span>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5">
                  {CAL_WEEKS.map((week, wi) => (
                    <div key={wi} className="flex h-6 items-center">
                      {week.map((day, di) => (
                        <span key={di} className="flex-1 flex items-center justify-center">
                          {day === CAL_TODAY ? (
                            <span
                              className="w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center"
                              style={{ background: t.accent.primary, color: '#fff' }}
                            >
                              {day}
                            </span>
                          ) : day ? (
                            <span className="text-[11px]" style={{ color: t.text.primary }}>{day}</span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-1.5">
                {EVENTS.map((ev, i) => (
                  <div key={i} className="flex rounded-md border overflow-hidden" style={{ borderColor: t.border.default }}>
                    <div className="w-[3px] shrink-0 self-stretch" style={{ background: colors[ev.semantic] }} />
                    <div className="flex items-center justify-between flex-1 px-3 py-1.5">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: t.text.primary }}>{ev.title}</p>
                        {ev.subtitle && <p className="text-[11px]" style={{ color: t.text.secondary }}>{ev.subtitle}</p>}
                      </div>
                      <span className="text-[11px] font-medium shrink-0" style={{ color: t.text.tertiary }}>{ev.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deadlines */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xs font-semibold" style={{ color: t.text.secondary }}>Upcoming Deadlines</h3>
                {DEADLINES.map((dl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <dl.icon size={14} style={{ color: colors[dl.semantic] }} />
                    <span className="text-xs font-medium" style={{ color: t.text.primary }}>{dl.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
