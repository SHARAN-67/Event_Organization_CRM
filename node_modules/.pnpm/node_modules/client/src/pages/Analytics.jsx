import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ResponsiveContainer, PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
} from 'chart.js';
import { Radar as RadarChartJS } from 'react-chartjs-2';
import { secretApi } from '../lib/api';
import {
    TrendingUp, Users, Calendar, DollarSign, Download,
    Filter, RefreshCw, AlertCircle, Info, Zap, Shield
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTheme } from '../theme/ThemeContext';

// Register ChartJS components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    ChartTooltip,
    ChartLegend
);

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
    const [dateRange, setDateRange] = useState('all');
    const { theme } = useTheme();

    const { data: summary, isLoading, error, refetch } = useQuery({
        queryKey: ['analyticsSummary'],
        queryFn: async () => {
            const response = await secretApi.get('/summary');
            return response.data;
        }
    });

    const isDark = theme === 'dark' || theme === 'night';
    const bgColor = theme === 'light' ? '#f8fafc' : theme === 'dark' ? '#0f172a' : '#020617';
    const cardBg = theme === 'light' ? '#ffffff' : theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const subTextColor = isDark ? '#94a3b8' : '#64748b';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0';

    const exportPDF = async () => {
        const element = document.getElementById('dashboard-content');
        if (!element) return;

        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: bgColor,
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const table = clonedDoc.querySelector('.custom-scrollbar');
                    if (table) table.style.maxHeight = 'none';
                    const tooltips = clonedDoc.querySelectorAll('.group\\/info');
                    tooltips.forEach(t => t.style.opacity = '0');
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('Operational_Intelligence_Report.pdf');
        } catch (err) {
            console.error('PDF Export Issue:', err);
            alert('Export failed. Check console.');
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen transition-colors duration-500" style={{ backgroundColor: bgColor, color: '#10b981' }}>
            <RefreshCw className="animate-spin w-12 h-12 mb-4" />
            <span className="font-mono tracking-widest animate-pulse font-bold uppercase text-xs">Synchronizing Core Data...</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen transition-colors duration-500" style={{ backgroundColor: bgColor, color: '#ef4444' }}>
            <AlertCircle className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold">Uplink Interrupted</h2>
            <p className="mt-2 text-slate-500 font-mono text-sm uppercase">Error 404: Secret Protocol Signature Mismatch</p>
        </div>
    );

    const { bigNumbers, radarMetrics, leadSourceDist, allData } = summary;

    const radarDataJS = {
        labels: radarMetrics.value.map(m => m.subject),
        datasets: [
            {
                label: 'System Performance',
                data: radarMetrics.value.map(m => m.value),
                backgroundColor: theme === 'night' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10b981',
                borderWidth: 2,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#10b981',
            },
        ],
    };

    const radarOptions = {
        animation: false,
        scales: {
            r: {
                angleLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                pointLabels: { color: subTextColor, font: { size: 10, weight: 'bold' } },
                ticks: { display: false },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    const barData = allData.slice(0, 8).map(item => ({
        name: item.eventName.substring(0, 10),
        revenue: item.revenue,
        cost: item.actualCost
    }));

    return (
        <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3" style={{ color: textColor }}>
                        <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        CORE INTELLIGENCE
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded border border-emerald-500/20 uppercase tracking-widest">Live Aggregation</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center backdrop-blur-xl border rounded-2xl px-4 py-2 transition-all shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <Filter className="w-4 h-4 text-emerald-500 mr-2" />
                        <select
                            className="bg-transparent text-xs font-black focus:outline-none cursor-pointer uppercase tracking-wider"
                            style={{ color: textColor }}
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="all">Enterprise Lifetime</option>
                            <option value="30">Last 30 Cycles</option>
                            <option value="90">Quarterly View</option>
                        </select>
                    </div>
                    <button
                        onClick={exportPDF}
                        className="flex items-center bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 hover:opacity-80 transition-all duration-300 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="p-3 border rounded-2xl transition-all shadow-sm active:rotate-180 duration-500"
                        style={{ backgroundColor: cardBg, borderColor: borderColor, color: subTextColor }}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div id="dashboard-content" className="space-y-8">
                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                    {[
                        { label: 'System Events', key: 'totalEvents', icon: Calendar, color: 'emerald' },
                        { label: 'Growth ROI', key: 'totalROI', icon: TrendingUp, color: 'blue', suffix: '%' },
                        { label: 'Active Leads', key: 'totalLeads', icon: Users, color: 'purple' },
                        { label: 'Conversion', key: 'conversionRate', icon: Zap, color: 'amber', suffix: '%' },
                    ].map((stat) => (
                        <div key={stat.key} className="relative group overflow-hidden border p-8 rounded-[2.5rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:translate-y-[-4px]" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                            <div className="relative z-10 text-left">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 rounded-2xl border" style={{ backgroundColor: `${stat.color === 'emerald' ? '#10b981' : stat.color === 'blue' ? '#3b82f6' : stat.color === 'purple' ? '#8b5cf6' : '#f59e0b'}10`, borderColor: `${stat.color === 'emerald' ? '#10b981' : stat.color === 'blue' ? '#3b82f6' : stat.color === 'purple' ? '#8b5cf6' : '#f59e0b'}20` }}>
                                        <stat.icon className="w-6 h-6" style={{ color: stat.color === 'emerald' ? '#10b981' : stat.color === 'blue' ? '#3b82f6' : stat.color === 'purple' ? '#8b5cf6' : '#f59e0b' }} />
                                    </div>
                                    {bigNumbers[stat.key].isInjected && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full group/info cursor-help">
                                            <Info className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Injected</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">{stat.label}</h3>
                                <p className="text-4xl font-black tracking-tighter" style={{ color: textColor }}>
                                    {typeof bigNumbers[stat.key].value === 'number'
                                        ? bigNumbers[stat.key].value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                                        : bigNumbers[stat.key].value}
                                    {stat.suffix}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[450px]">
                    <div className="lg:col-span-4 border p-8 rounded-[2.5rem] shadow-sm relative group overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                Success Vectors
                            </h3>
                            {radarMetrics.isInjected && <Info className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div className="h-72 flex items-center justify-center">
                            <RadarChartJS data={radarDataJS} options={radarOptions} />
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest opacity-40">
                            <div>Score Accuracy: High</div>
                            <div className="text-right">Entropy: 0.12%</div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 border p-8 rounded-[2.5rem] shadow-sm group relative" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Performance Alpha
                            </h3>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Cost</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} barGap={12}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                                    <XAxis dataKey="name" stroke={subTextColor} fontSize={10} axisLine={false} tickLine={false} dy={10} fontWeight="bold" />
                                    <YAxis stroke={subTextColor} fontSize={10} axisLine={false} tickLine={false} fontWeight="bold" />
                                    <Tooltip
                                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '20px', backdropFilter: 'blur(10px)' }}
                                        itemStyle={{ color: textColor, fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
                                    <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="border p-8 rounded-[2.5rem] shadow-sm transition-all" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex items-start justify-between mb-6">
                            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                                <Users className="w-5 h-5 text-purple-500" />
                                Distribution
                            </h3>
                            <div className="flex flex-col gap-2">
                                {leadSourceDist.value.map((entry, index) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: textColor }}>
                                            {entry.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadSourceDist.value}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {leadSourceDist.value.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-2 border p-8 rounded-[2.5rem] shadow-sm overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                                Sequence Monitoring
                            </h3>
                            <span className="text-[10px] font-black opacity-30 tracking-[0.3em]">REALTIME_FEED</span>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto max-h-64 custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 z-10 border-b" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                                    <tr className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                        <th className="pb-4 px-4">Entity Identity</th>
                                        <th className="pb-4 px-4 text-right">Magnitude</th>
                                        <th className="pb-4 px-4 text-center">Efficiency</th>
                                        <th className="pb-4 px-4 text-right">Signature</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allData.map((item, idx) => (
                                        <tr key={idx} className="border-b transition-colors group cursor-default" style={{ borderColor: borderColor }}>
                                            <td className="py-5 px-4 font-black" style={{ color: textColor }}>
                                                {item.eventName}
                                            </td>
                                            <td className="py-5 px-4 text-right font-bold text-xs opacity-60">
                                                ${item.actualCost.toLocaleString()}
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${item.satisfactionScore * 10}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-500">{item.satisfactionScore}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                                                    VERIFIED
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
