import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            titleFont: { size: 14, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
            bodyFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
            cornerRadius: 12,
            displayColors: false,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: '500' }, color: '#9ca3af' }
        },
        y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6', drawBorder: false },
            ticks: { 
                font: { size: 12 }, 
                color: '#9ca3af',
                callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value
            }
        },
    },
};

export const RevenueAreaChart = ({ data, color = '#10b981' }) => {
    const chartData = {
        labels: data.map(d => new Date(d.month).toLocaleDateString('default', { month: 'short' })),
        datasets: [{
            label: 'Revenue',
            data: data.map(d => Number(d.total)),
            borderColor: color,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, `${color}33`);
                gradient.addColorStop(1, `${color}00`);
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
        }],
    };

    return <Line options={commonOptions} data={chartData} />;
};

export const RoomTypeDonutChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => d.room_type),
        datasets: [{
            data: data.map(d => Number(d.count)),
            backgroundColor: [
                '#10b981',
                '#3b82f6',
                '#f59e0b',
                '#6366f1',
                '#ec4899',
            ],
            hoverOffset: 4,
            borderRadius: 8,
            spacing: 5,
        }],
    };

    const options = {
        ...commonOptions,
        scales: { x: { display: false }, y: { display: false } },
        plugins: {
            ...commonOptions.plugins,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { size: 12, weight: '600' }
                }
            }
        },
        cutout: '70%',
    };

    return <Doughnut data={chartData} options={options} />;
};

export const UserGrowthBarChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => new Date(d.month).toLocaleDateString('default', { month: 'short' })),
        datasets: [{
            label: 'New Users',
            data: data.map(d => Number(d.count)),
            backgroundColor: '#6366f1',
            borderRadius: 10,
            barThickness: 20,
        }],
    };

    return <Bar options={commonOptions} data={chartData} />;
};
