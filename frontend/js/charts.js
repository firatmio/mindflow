const chartInstances = new Map();

function getChartLibrary() {
	return typeof window !== "undefined" ? window.Chart : undefined;
}

function destroyChart(canvasId) {
	const existingChart = chartInstances.get(canvasId);
	if (existingChart) {
		existingChart.destroy();
		chartInstances.delete(canvasId);
	}
}

function getCanvas(canvasId) {
	const element = document.getElementById(canvasId);
	return element instanceof HTMLCanvasElement ? element : null;
}

function buildCounts(entries) {
	const counts = {
		mutlu: 0,
		üzgün: 0,
		stresli: 0,
		dengeli: 0,
	};

	entries.forEach((entry) => {
		if (counts[entry.label] !== undefined) {
			counts[entry.label] += 1;
		}
	});

	return counts;
}

function buildTrendPoints(entries) {
	return entries.slice().reverse().map((entry) => ({
		label: new Date(entry.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
		energy: Number(entry.energy ?? 60),
		stress: Number(entry.stress ?? 30),
	}));
}

export function renderMoodCharts(entries) {
	const Chart = getChartLibrary();
	if (!Chart) {
		return null;
	}

	const normalizedEntries = Array.isArray(entries) ? entries : [];
	const trendCanvas = getCanvas("mood-trend-chart");
	const breakdownCanvas = getCanvas("emotion-breakdown-chart");
	const energyCanvas = getCanvas("energy-chart");

	if (trendCanvas) {
		destroyChart("mood-trend-chart");
		const trendPoints = buildTrendPoints(normalizedEntries.slice(-10));
		chartInstances.set("mood-trend-chart", new Chart(trendCanvas, {
			type: "line",
			data: {
				labels: trendPoints.map((point) => point.label),
				datasets: [
					{
						label: "Enerji",
						data: trendPoints.map((point) => point.energy),
						borderColor: "#22c55e",
						backgroundColor: "rgba(34, 197, 94, 0.15)",
						tension: 0.4,
						fill: true,
					},
					{
						label: "Stres",
						data: trendPoints.map((point) => point.stress),
						borderColor: "#ef4444",
						backgroundColor: "rgba(239, 68, 68, 0.12)",
						tension: 0.4,
						fill: true,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { labels: { color: "#c9ced7" } },
				},
				scales: {
					x: { ticks: { color: "#8f98a8" }, grid: { color: "rgba(255,255,255,0.05)" } },
					y: { ticks: { color: "#8f98a8" }, grid: { color: "rgba(255,255,255,0.05)" } },
				},
			},
		}));
	}

	if (breakdownCanvas) {
		destroyChart("emotion-breakdown-chart");
		const counts = buildCounts(normalizedEntries);
		chartInstances.set("emotion-breakdown-chart", new Chart(breakdownCanvas, {
			type: "doughnut",
			data: {
				labels: ["Mutlu", "Üzgün", "Stresli", "Dengeli"],
				datasets: [{
					data: [counts.mutlu, counts.üzgün, counts.stresli, counts.dengeli],
					backgroundColor: ["#22c55e", "#8b5cf6", "#f97316", "#38bdf8"],
					borderWidth: 0,
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: "bottom",
						labels: { color: "#c9ced7", padding: 18 },
					},
				},
				cutout: "68%",
			},
		}));
	}

	if (energyCanvas) {
		destroyChart("energy-chart");
		const recentEntries = normalizedEntries.slice(-7);
		chartInstances.set("energy-chart", new Chart(energyCanvas, {
			type: "bar",
			data: {
				labels: recentEntries.map((entry) => new Date(entry.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })),
				datasets: [{
					label: "Enerji",
					data: recentEntries.map((entry) => Number(entry.energy ?? 60)),
					backgroundColor: "rgba(34, 197, 94, 0.75)",
					borderRadius: 12,
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
				},
				scales: {
					x: { ticks: { color: "#8f98a8" }, grid: { display: false } },
					y: { ticks: { color: "#8f98a8" }, grid: { color: "rgba(255,255,255,0.05)" }, suggestedMax: 100 },
				},
			},
		}));
	}

	return chartInstances;
}

export function destroyMoodCharts() {
	chartInstances.forEach((chart) => chart.destroy());
	chartInstances.clear();
}