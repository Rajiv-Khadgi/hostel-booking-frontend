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
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export const RevenueLineChart = ({ data }) => {
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#111827',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false,
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { 
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: { callback: (value) => 'Rs.' + value.toLocaleString() }
            },
        },
    };

    const chartData = {
        labels: data.map(d => new Date(d.month).toLocaleDateString('default', { month: 'short' })),
        datasets: [{
            label: 'Revenue',
            data: data.map(d => Number(d.total)),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
        }],
    };

    return <Line options={options} data={chartData} />;
};

export const RoomTypePieChart = ({ data }) => {
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
            borderWidth: 0,
        }],
    };

    const options = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 20 },
            },
        },
    };

    return <Pie data={chartData} options={options} />;
};
