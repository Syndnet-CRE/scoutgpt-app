import {
  TrendingDown, FileText, Star, AlertTriangle, Check, Sparkles,
  BarChart3, TrendingUp, Building, Calendar, ChevronLeft, ChevronRight,
  Clock,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Active Deals', value: '8', change: '+2 this week', changeColor: 'text-green-600' },
  { label: 'Pipeline Value', value: '$4.2M', change: '+12%', changeColor: 'text-green-600' },
  { label: 'Buy Box Matches', value: '14', change: '3 new today', changeColor: 'text-blue-600' },
];

const FEED_ITEMS = [
  { icon: TrendingDown, iconColor: 'text-red-600', bg: 'bg-red-100', title: 'Price Drop Alert', desc: '1200 Main St dropped 12% to $2.4M', time: '2m' },
  { icon: FileText, iconColor: 'text-green-600', bg: 'bg-green-100', title: 'Deal Update', desc: 'Westfield Plaza moved to Due Diligence', time: '15m' },
  { icon: Star, iconColor: 'text-yellow-600', bg: 'bg-yellow-100', title: 'Buy Box Match', desc: '3 new parcels match your Industrial buy box', time: '1h' },
  { icon: AlertTriangle, iconColor: 'text-orange-600', bg: 'bg-orange-50', title: 'Market Alert', desc: 'Cap rates rising in Downtown submarket', time: '2h' },
  { icon: Check, iconColor: 'text-green-600', bg: 'bg-green-100', title: 'Deal Closed', desc: 'Harbor View Apartments - $5.2M', time: '3h' },
  { icon: Sparkles, iconColor: 'text-blue-600', bg: 'bg-blue-50', title: 'AI Insight', desc: 'Scout found 8 distressed assets matching your criteria', time: '4h' },
  { icon: Star, iconColor: 'text-yellow-600', bg: 'bg-yellow-100', title: 'Property Sold', desc: 'Oakwood Center removed from watchlist', time: '5h' },
];

const TASKS = [
  { dot: 'bg-red-600', text: 'Send LOI to Cameron Rd owner', due: 'by 5pm' },
  { dot: 'bg-orange-600', text: 'Review proforma — Pflugerville', due: 'by EOD' },
  { dot: 'bg-blue-600', text: 'Prep Sequoia deck updates', due: 'by Wed' },
];

const INSIGHTS = [
  {
    icon: BarChart3,
    tag: 'Market Report',
    tagBg: 'bg-blue-50',
    tagColor: 'text-blue-600',
    date: 'Jan 28, 2025',
    headline: 'Q4 2024 Industrial Market Overview',
    body: 'Industrial vacancy rates hit historic lows at 3.2% while asking rents increased 8.5% YoY...',
    aiText: 'Based on current trends, expect 5-7% rent growth in Class A industrial through Q2 2025. Focus on infill locations near...',
    readTime: '5 min read',
  },
  {
    icon: TrendingUp,
    tag: 'Investment Analysis',
    tagBg: 'bg-violet-100',
    tagColor: 'text-violet-600',
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
  tagBg: 'bg-blue-50',
  tagColor: 'text-blue-600',
  date: 'Jan 24, 2025',
  headline: 'Office-to-Residential Conversions Surge',
  body: 'Class B/C office conversions up 340% since 2022. Cities offering tax incentives driving adaptive reuse in...',
  readTime: '4 min read',
};

const TRENDING = [
  { rank: 1, rankBg: 'bg-blue-600', name: 'Westfield Distribution Center', meta: 'Industrial \u2022 Phoenix, AZ', stat: '+24', statColor: 'text-green-600' },
  { rank: 2, rankBg: 'bg-blue-600', name: 'Harbor Bay Apartments', meta: 'Multifamily \u2022 San Diego, CA', stat: '+18', statColor: 'text-green-600' },
  { rank: 3, rankBg: 'bg-green-600', name: '\u201cNNN retail Austin\u201d', meta: 'Search term', stat: '142', statColor: 'text-slate-500', isSearch: true },
  { rank: 4, rankBg: 'bg-slate-500', name: 'Oakwood Office Park', meta: 'Office \u2022 Denver, CO', stat: '+12', statColor: 'text-green-600' },
  { rank: 5, rankBg: 'bg-green-600', name: '\u201cValue-add multifamily\u201d', meta: 'Search term', stat: '98', statColor: 'text-slate-500', isSearch: true },
  { rank: 6, rankBg: 'bg-slate-500', name: 'Metro Flex Warehouse', meta: 'Industrial \u2022 Dallas, TX', stat: '+8', statColor: 'text-green-600' },
  { rank: 7, rankBg: 'bg-green-600', name: '\u201cCap rate 7%+\u201d', meta: 'Search term', stat: '87', statColor: 'text-slate-500', isSearch: true },
  { rank: 8, rankBg: 'bg-slate-500', name: 'Sunrise Medical Plaza', meta: 'Medical Office \u2022 Tampa, FL', stat: '+6', statColor: 'text-green-600' },
];

const EVENTS = [
  { barColor: 'bg-blue-600', title: '9:00 AM \u2014 Standup', subtitle: 'Dheeraj & Arpan', duration: '30m' },
  { barColor: 'bg-green-600', title: '10:30 AM \u2014 Investor Call', subtitle: 'Sequoia Scout', duration: '45m' },
  { barColor: 'bg-violet-600', title: '1:00 PM \u2014 ScoutGPT v2 Demo Review', subtitle: null, duration: '1h' },
  { barColor: 'bg-blue-600', title: '3:00 PM \u2014 Tom Staub \u2014 CRO Sync', subtitle: null, duration: '30m' },
  { barColor: 'bg-violet-600', title: '4:00 PM \u2014 ATTOM Integration Check', subtitle: null, duration: '30m' },
];

const DEADLINES = [
  { icon: AlertTriangle, iconColor: 'text-orange-600', text: 'Cameron Rd LOI expires \u2014 3 days' },
  { icon: Clock, iconColor: 'text-slate-400', text: 'Closing docs due (Pflugerville) \u2014 5 days' },
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
  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="p-6">
        <div className="flex gap-5">
          {/* Left + Center Wrap */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-slate-200 px-5 py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-[15px] font-bold text-slate-900 shrink-0">Quick Stats</h2>
                <div className="flex gap-3 flex-1">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex-1 bg-slate-50 rounded-md border border-slate-200 p-3.5 flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-slate-500">{s.label}</span>
                      <span className="text-2xl font-bold text-slate-900">{s.value}</span>
                      <span className={`text-[11px] font-medium ${s.changeColor}`}>{s.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed + Insights columns */}
            <div className="flex gap-5">
              {/* Left Column — Feed & Tasks */}
              <div className="w-[260px] shrink-0">
                <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col gap-4">
                  {/* Feed header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-bold text-slate-900">Your Feed</h2>
                      <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 h-[22px] flex items-center rounded-full">4 new</span>
                    </div>
                    <button className="text-xs font-semibold text-blue-600">View All</button>
                  </div>

                  {/* Feed items */}
                  <div className="flex flex-col">
                    {FEED_ITEMS.map((item, i) => (
                      <div key={i} className={`flex gap-2.5 py-2.5 ${i < FEED_ITEMS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <div className={`w-7 h-7 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                          <item.icon size={14} className={item.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-slate-200" />

                  {/* Tasks */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-slate-900">Tasks</h3>
                      <span className="text-[11px] font-medium text-slate-500">3 due today</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {TASKS.map((task, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm border border-slate-300 shrink-0" />
                          <div className={`w-1.5 h-1.5 rounded-sm ${task.dot} shrink-0`} />
                          <span className="text-xs font-medium text-slate-900 flex-1 truncate">{task.text}</span>
                          <span className="text-[11px] text-slate-400 shrink-0">{task.due}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column — Featured Insights */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[15px] font-bold text-slate-900">Featured Insights</h2>
                    <button className="text-xs font-semibold text-blue-600">Browse All</button>
                  </div>

                  {/* Two insight cards side by side */}
                  <div className="flex gap-4">
                    {INSIGHTS.map((card, i) => (
                      <div key={i} className="flex-1 rounded-md border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-slate-50 h-[140px] flex items-center justify-center">
                          <card.icon size={32} className="text-slate-300" />
                        </div>
                        <div className="p-3.5 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`${card.tagBg} ${card.tagColor} text-[10px] font-semibold px-2 h-5 flex items-center rounded-full`}>{card.tag}</span>
                            <span className="text-[11px] text-slate-400">{card.date}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">{card.headline}</h3>
                          <p className="text-xs text-slate-500 leading-[1.4]">{card.body}</p>
                          <div className="bg-blue-50 rounded-md p-2.5 flex gap-2">
                            <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold text-blue-600">AI Insight</span>
                              <p className="text-[11px] text-blue-800 leading-[1.4]">{card.aiText}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">{card.readTime}</span>
                            <button className="text-xs font-semibold text-blue-600">Read More &rarr;</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Full-width insight card 3 */}
                  <div className="rounded-md border border-slate-200 overflow-hidden flex flex-col">
                    <div className="bg-slate-50 h-[140px] flex items-center justify-center">
                      <INSIGHT_FULL.icon size={32} className="text-slate-300" />
                    </div>
                    <div className="p-3.5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`${INSIGHT_FULL.tagBg} ${INSIGHT_FULL.tagColor} text-[10px] font-semibold px-2 h-5 flex items-center rounded-full`}>{INSIGHT_FULL.tag}</span>
                        <span className="text-[11px] text-slate-400">{INSIGHT_FULL.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{INSIGHT_FULL.headline}</h3>
                      <p className="text-xs text-slate-500 leading-[1.4]">{INSIGHT_FULL.body}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">{INSIGHT_FULL.readTime}</span>
                        <button className="text-xs font-semibold text-blue-600">Read More &rarr;</button>
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
            <div className="bg-white rounded-lg border border-slate-200 px-5 py-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-slate-900">Trending</h2>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-[5px]">Properties</span>
                  <span className="text-slate-500 text-[11px] font-medium px-2.5 py-1">Searches</span>
                </div>
              </div>
              <div className="flex flex-col">
                {TRENDING.map((t) => (
                  <div key={t.rank} className="flex items-center gap-2.5 py-[5px]">
                    <div className={`w-[22px] h-[22px] rounded-full ${t.rankBg} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-[10px] font-bold">{t.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${t.isSearch ? 'text-green-600' : 'text-slate-900'}`}>{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.meta}</p>
                    </div>
                    <span className={`text-[11px] font-semibold ${t.statColor} shrink-0`}>{t.stat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white rounded-lg border border-slate-200 px-5 py-3 flex flex-col gap-2.5">
              {/* Schedule Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500" />
                  <h2 className="text-[15px] font-bold text-slate-900">Today &mdash; Feb 17</h2>
                </div>
                <button className="text-xs font-semibold text-blue-600">Full Calendar &rarr;</button>
              </div>

              {/* Mini Calendar */}
              <div className="bg-white rounded-lg border border-slate-200 px-3.5 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ChevronLeft size={14} className="text-slate-400 cursor-pointer" />
                    <span className="text-xs font-semibold text-slate-900">February 2025</span>
                    <ChevronRight size={14} className="text-slate-400 cursor-pointer" />
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 cursor-pointer">Today</span>
                </div>
                <div className="flex">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="flex-1 text-center text-[10px] font-semibold text-slate-400">{d}</span>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5">
                  {CAL_WEEKS.map((week, wi) => (
                    <div key={wi} className="flex h-6 items-center">
                      {week.map((day, di) => (
                        <span key={di} className="flex-1 flex items-center justify-center">
                          {day === CAL_TODAY ? (
                            <span className="w-[22px] h-[22px] rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">{day}</span>
                          ) : day ? (
                            <span className="text-[11px] text-slate-900">{day}</span>
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
                  <div key={i} className="flex rounded-md border border-slate-200 overflow-hidden">
                    <div className={`w-[3px] shrink-0 self-stretch ${ev.barColor}`} />
                    <div className="flex items-center justify-between flex-1 px-3 py-1.5">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{ev.title}</p>
                        {ev.subtitle && <p className="text-[11px] text-slate-500">{ev.subtitle}</p>}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">{ev.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deadlines */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xs font-semibold text-slate-500">Upcoming Deadlines</h3>
                {DEADLINES.map((dl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <dl.icon size={14} className={dl.iconColor} />
                    <span className="text-xs font-medium text-slate-900">{dl.text}</span>
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
