import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import StudentDashboard from './roles/StudentDashboard';
import OwnerDashboard from './roles/OwnerDashboard';
import AdminDashboard from './roles/AdminDashboard';

export default function Overview() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [exportingCsv, setExportingCsv] = useState(false);

    const REPORT_THEME = {
        primary: [16, 185, 129],
        primarySoft: [236, 253, 245],
        heading: [17, 24, 39],
        muted: [107, 114, 128],
        border: [209, 250, 229],
        white: [255, 255, 255],
    };

    const formatLabel = (key) => {
        return String(key)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^./, (char) => char.toUpperCase());
    };

    const formatValue = (key, value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';

        if (typeof value === 'number') {
            const lowerKey = String(key).toLowerCase();
            if (lowerKey.includes('revenue') || lowerKey.includes('earning') || lowerKey.includes('spent') || lowerKey.includes('amount') || lowerKey.includes('price')) {
                return `Rs. ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
            }
            if (lowerKey.includes('growth') || lowerKey.includes('rate') || lowerKey.includes('conversion')) {
                return `${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;
            }
            return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        }

        if (typeof value === 'string') return value;
        return JSON.stringify(value);
    };

    const toCsvSafeValue = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const csvEscape = (value) => {
        const stringValue = toCsvSafeValue(value);
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const createCsvFromRows = (rows) => {
        return rows
            .map((row) => row.map((cell) => csvEscape(cell)).join(','))
            .join('\r\n');
    };

    const truncateText = (value, maxLength = 30) => {
        const text = toCsvSafeValue(value);
        return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
    };

    const ensurePageSpace = (doc, y, required = 10) => {
        if (y + required <= 280) return y;
        doc.addPage();
        return 16;
    };

    const writeSectionTitle = (doc, title, y) => {
        doc.setDrawColor(...REPORT_THEME.border);
        doc.setLineWidth(0.3);
        doc.line(14, y + 1.5, 196, y + 1.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...REPORT_THEME.heading);
        doc.setFontSize(13);
        doc.text(title, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...REPORT_THEME.heading);
        return y + 8;
    };

    const drawHeader = (doc, role, generatedDateTime) => {
        doc.setFillColor(...REPORT_THEME.primary);
        doc.rect(0, 0, 210, 44, 'F');

        doc.setTextColor(...REPORT_THEME.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(21);
        doc.text('Dashboard Analytics Report', 14, 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Role: ${formatLabel(role)} | Generated: ${generatedDateTime}`, 14, 26);
        doc.text(`User: ${(user?.first_name || 'N/A')} ${(user?.last_name || '')}`.trim(), 14, 32);

        doc.setTextColor(...REPORT_THEME.heading);
        doc.setFillColor(...REPORT_THEME.primarySoft);
        doc.roundedRect(14, 50, 182, 12, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Live snapshot of role-scoped dashboard metrics and chart summaries', 17, 57.5);
    };

    const renderMetricCards = (doc, entries, yStart) => {
        let y = yStart;
        const cardWidth = 88;
        const cardHeight = 22;
        const xLeft = 14;
        const xRight = 108;

        for (let i = 0; i < entries.length; i += 2) {
            y = ensurePageSpace(doc, y, cardHeight + 4);

            const pair = [entries[i], entries[i + 1]].filter(Boolean);
            pair.forEach(([key, value], cardIndex) => {
                const x = cardIndex === 0 ? xLeft : xRight;
                doc.setFillColor(...REPORT_THEME.white);
                doc.setDrawColor(...REPORT_THEME.border);
                doc.roundedRect(x, y, cardWidth, cardHeight, 2.5, 2.5, 'FD');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(...REPORT_THEME.muted);
                doc.text(formatLabel(key), x + 4, y + 7);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.setTextColor(...REPORT_THEME.heading);
                const valueLines = doc.splitTextToSize(formatValue(key, value), cardWidth - 8);
                doc.text(valueLines.slice(0, 2), x + 4, y + 14);
            });

            y += cardHeight + 4;
        }

        return y + 2;
    };

    const renderChartSection = (doc, chartTitle, rows, yStart) => {
        if (!Array.isArray(rows) || rows.length === 0) return yStart;

        let y = ensurePageSpace(doc, yStart, 24);
        y = writeSectionTitle(doc, chartTitle, y);

        const maxRows = 10;
        const viewRows = rows.slice(0, maxRows);
        const keys = [...new Set(viewRows.flatMap((row) => Object.keys(row || {})))].slice(0, 4);

        if (keys.length === 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...REPORT_THEME.muted);
            doc.text('No chart rows available', 16, y);
            return y + 8;
        }

        const tableX = 14;
        const tableWidth = 182;
        const rowHeight = 7;
        const colWidth = tableWidth / keys.length;

        y = ensurePageSpace(doc, y, rowHeight * (viewRows.length + 2));

        doc.setFillColor(...REPORT_THEME.primarySoft);
        doc.setDrawColor(...REPORT_THEME.border);
        doc.rect(tableX, y, tableWidth, rowHeight, 'FD');

        keys.forEach((key, index) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...REPORT_THEME.heading);
            doc.text(formatLabel(key), tableX + (index * colWidth) + 2, y + 4.8, {
                maxWidth: colWidth - 4,
            });
        });

        y += rowHeight;
        viewRows.forEach((row, rowIndex) => {
            y = ensurePageSpace(doc, y, rowHeight + 1);

            if (rowIndex % 2 === 0) {
                doc.setFillColor(250, 252, 251);
                doc.rect(tableX, y, tableWidth, rowHeight, 'F');
            }

            doc.setDrawColor(229, 231, 235);
            doc.rect(tableX, y, tableWidth, rowHeight);

            keys.forEach((key, index) => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(...REPORT_THEME.heading);
                doc.text(
                    truncateText(row?.[key], 22),
                    tableX + (index * colWidth) + 2,
                    y + 4.6,
                    { maxWidth: colWidth - 4 }
                );
            });

            y += rowHeight;
        });

        if (rows.length > maxRows) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(...REPORT_THEME.muted);
            doc.text(`Showing first ${maxRows} of ${rows.length} records`, 14, y + 4);
            y += 6;
        }

        return y + 4;
    };

    const handleDownloadReport = () => {
        if (!stats || !stats.metrics) {
            setError('Dashboard data is not available for report generation');
            return;
        }

        try {
            setDownloadingReport(true);
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const role = user?.role || 'user';
            const generatedAt = new Date();
            const generatedDateTime = generatedAt.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            drawHeader(doc, role, generatedDateTime);

            let y = 70;
            y = writeSectionTitle(doc, 'Core Metrics', y);
            y = renderMetricCards(doc, Object.entries(stats.metrics || {}), y);

            const chartEntries = Object.entries(stats.charts || {});
            chartEntries.forEach(([chartKey, chartData]) => {
                if (Array.isArray(chartData)) {
                    y = renderChartSection(doc, `Chart: ${formatLabel(chartKey)}`, chartData, y);
                }
            });

            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i += 1) {
                doc.setPage(i);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...REPORT_THEME.muted);
                doc.text(`Page ${i} of ${totalPages}`, 180, 292);
            }

            const fileDate = generatedAt.toISOString().split('T')[0];
            doc.save(`dashboard-report-${role}-${fileDate}.pdf`);
        } catch (reportError) {
            console.error('Failed to generate dashboard report:', reportError);
            setError('Failed to generate dashboard report. Please try again.');
        } finally {
            setDownloadingReport(false);
        }
    };

    const handleExportCsv = () => {
        if (!stats || !stats.metrics) {
            setError('Dashboard data is not available for CSV export');
            return;
        }

        try {
            setExportingCsv(true);
            const generatedAt = new Date();
            const role = user?.role || 'user';

            const rows = [
                ['Dashboard Analytics CSV Export'],
                ['Role', formatLabel(role)],
                ['User', `${user?.first_name || 'N/A'} ${user?.last_name || ''}`.trim()],
                ['Generated At', generatedAt.toISOString()],
                [],
                ['Core Metrics'],
                ['Metric', 'Value'],
            ];

            Object.entries(stats.metrics || {}).forEach(([key, value]) => {
                rows.push([formatLabel(key), formatValue(key, value)]);
            });

            rows.push([]);
            rows.push(['Chart Data']);

            Object.entries(stats.charts || {}).forEach(([chartKey, chartRows]) => {
                rows.push([formatLabel(chartKey)]);

                if (!Array.isArray(chartRows) || chartRows.length === 0) {
                    rows.push(['No data']);
                    rows.push([]);
                    return;
                }

                const keys = [...new Set(chartRows.flatMap((row) => Object.keys(row || {})))];
                rows.push(['Row', ...keys.map((key) => formatLabel(key))]);

                chartRows.forEach((row, index) => {
                    rows.push([
                        index + 1,
                        ...keys.map((key) => toCsvSafeValue(row?.[key])),
                    ]);
                });

                rows.push([]);
            });

            const csvContent = createCsvFromRows(rows);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard-report-${role}-${generatedAt.toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (csvError) {
            console.error('Failed to export CSV report:', csvError);
            setError('Failed to export CSV report. Please try again.');
        } finally {
            setExportingCsv(false);
        }
    };

    const fetchStats = React.useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/dashboard/stats');
            setStats(res.data.stats);
        } catch (err) {
            setError('Failed to load dashboard statistics');
            console.error('Dashboard Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Curating your analytics...</p>
            </div>
        );
    }

    if (!stats || !stats.metrics) return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <p>No data available yet.</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">
                        {user?.role} Portal
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                    Welcome back, <span className="text-emerald-600">{user?.first_name}</span>.
                </h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">
                    Here's a perspective on your hostel platform activity today.
                </p>
            </header>

            {error && (
                <div className="mb-8 bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <p className="font-bold">{error}</p>
                    <button
                        onClick={fetchStats}
                        className="ml-auto px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="relative">
                {user?.role === 'student' && <StudentDashboard stats={stats} />}
                {user?.role === 'owner' && <OwnerDashboard stats={stats} />}
                {user?.role === 'admin' && <AdminDashboard stats={stats} />}
            </div>

            <footer className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm font-medium">
                <p>© 2024 Hostel Booking Pern. All analytics are real-time.</p>
                <div className="flex gap-6">
                    <button
                        onClick={handleDownloadReport}
                        disabled={downloadingReport}
                        className="hover:text-gray-600 transition-colors underline decoration-2 underline-offset-4 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {downloadingReport ? 'Generating Report...' : 'Download PDF Report'}
                    </button>
                    <button
                        onClick={handleExportCsv}
                        disabled={exportingCsv}
                        className="hover:text-gray-600 transition-colors underline decoration-2 underline-offset-4 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {exportingCsv ? 'Exporting CSV...' : 'Export as CSV'}
                    </button>
                </div>
            </footer>
        </div>
    );
}
