import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import { BarChart3 } from "lucide-react";

ChartJS.register(
  TimeScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale
);

const EmotionChart = ({ emotionTimeline = [] }) => {
  const emotionCount = {};

  emotionTimeline.forEach(({ emotion }) => {
    emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
  });

  const emotionColors = {
    happy: { bg: "rgba(16, 185, 129, 0.7)", border: "rgb(16, 185, 129)" },
    sad: { bg: "rgba(59, 130, 246, 0.7)", border: "rgb(59, 130, 246)" },
    angry: { bg: "rgba(239, 68, 68, 0.7)", border: "rgb(239, 68, 68)" },
    surprised: { bg: "rgba(245, 158, 11, 0.7)", border: "rgb(245, 158, 11)" },
    neutral: { bg: "rgba(156, 163, 175, 0.7)", border: "rgb(156, 163, 175)" },
    fearful: { bg: "rgba(139, 92, 246, 0.7)", border: "rgb(139, 92, 246)" },
    disgusted: { bg: "rgba(236, 72, 153, 0.7)", border: "rgb(236, 72, 153)" },
  };

  const labels = Object.keys(emotionCount);
  const bgColors = labels.map(
    (label) => emotionColors[label]?.bg || "rgba(14, 165, 233, 0.7)"
  );
  const borderColors = labels.map(
    (label) => emotionColors[label]?.border || "rgb(14, 165, 233)"
  );

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Emotion Frequency",
        data: Object.values(emotionCount),
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 flex items-center justify-center gap-2">
        <BarChart3 className="w-5 h-5 text-sky-500" />
        Emotion Analysis Summary
      </h3>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
                title: {
                  display: true,
                  text: "Frequency",
                  color: "#6b7280",
                  font: {
                    weight: "500",
                  },
                },
                ticks: {
                  color: "#9ca3af",
                },
              },
              x: {
                grid: {
                  display: false,
                },
                title: {
                  display: true,
                  text: "Emotion",
                  color: "#6b7280",
                  font: {
                    weight: "500",
                  },
                },
                ticks: {
                  color: "#9ca3af",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default EmotionChart;
