let chartInstance = null;

export function renderTrendChart(canvasId, trendData) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = trendData.map((item) => item.date);
  const counts = trendData.map((item) => item.total);

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Jumlah Titik Panas",
          data: counts,
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#f3f4f6" } },
      },
      scales: {
        x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "#374151" },
          beginAtZero: true,
        },
      },
    },
  });
}
