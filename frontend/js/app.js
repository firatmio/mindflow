// Dashboard akisi: form gonderimi, render, KPI ve grafikler.
import {
	analyzeJournal,
	getDailyAffirmation,
	getJournalEntries,
	getStoredProfile,
	getStoredSettings,
	saveJournalEntry,
	saveStoredProfile,
	saveStoredSettings,
} from "./api.js";
import { renderMoodCharts } from "./charts.js";

// localStorage ve backend ile senkron state.
const state = {
	entries: [],
	profile: getStoredProfile(),
	settings: getStoredSettings(),
};

function byId(id) {
	return document.getElementById(id);
}

function formatDate(value) {
	return new Date(value).toLocaleString("tr-TR", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getMoodLabel(label) {
	const mapping = {
		mutlu: "Mutlu",
		üzgün: "Üzgün",
		stresli: "Stresli",
		dengeli: "Dengeli",
	};
	return mapping[label] || "Dengeli";
}

function getMoodClass(label) {
	return `mood-${label || "dengeli"}`;
}

function updateStat(id, value) {
	const element = byId(id);
	if (element) {
		element.textContent = String(value);
	}
}

// KPI yardimcilari.
function calcAverage(entries, key) {
	if (!entries.length) {
		return 0;
	}
	const total = entries.reduce((sum, entry) => sum + Number(entry[key] || 0), 0);
	return Math.round(total / entries.length);
}

function calcStreak(entries) {
	const days = new Set(entries.map((entry) => new Date(entry.created_at).toDateString()));
	return days.size;
}

function calcDominantMood(entries) {
	if (!entries.length) {
		return "Dengeli";
	}

	const counts = entries.reduce((accumulator, entry) => {
		accumulator[entry.label] = (accumulator[entry.label] || 0) + 1;
		return accumulator;
	}, {});

	const dominant = Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0];
	return getMoodLabel(dominant);
}

// UI render yardimcilari.
function renderProfile() {
	const nameInput = byId("profile-name");
	const focusInput = byId("profile-focus");
	const soundToggle = byId("zen-sound-toggle");
	const autoZenToggle = byId("auto-zen-toggle");

	if (nameInput) {
		nameInput.value = state.profile.name || "";
	}

	if (focusInput) {
		focusInput.value = state.profile.focus || "genel";
	}

	if (soundToggle) {
		soundToggle.checked = Boolean(state.settings.zenSoundEnabled);
	}

	if (autoZenToggle) {
		autoZenToggle.checked = Boolean(state.settings.autoZenOnStress);
	}
}

function renderHistory(entries) {
	const list = byId("journal-history");
	if (!list) {
		return;
	}

	if (!entries.length) {
		list.innerHTML = '<div class="empty-state">Henüz kayıt yok. İlk günlüğünü yaz.</div>';
		return;
	}

	list.innerHTML = entries.slice(0, 6).map((entry) => `
		<article class="history-item">
			<div class="history-head">
				<strong>${getMoodLabel(entry.label)}</strong>
				<span>${formatDate(entry.created_at)}</span>
			</div>
			<p>${entry.text}</p>
			<div class="history-meta">
				<span class="badge ${getMoodClass(entry.label)}">${getMoodLabel(entry.label)}</span>
				<span>Enerji ${entry.energy}</span>
				<span>Stres ${entry.stress}</span>
			</div>
		</article>
	`).join("");
}

function renderSummary(entry) {
	const moodBadge = byId("current-mood");
	const analysisText = byId("analysis-text");
	const analysisScore = byId("analysis-score");
	const analysisEnergy = byId("analysis-energy");
	const analysisStress = byId("analysis-stress");
	const suggestionList = byId("analysis-suggestions");

	if (moodBadge) {
		moodBadge.textContent = getMoodLabel(entry.label);
		moodBadge.className = `badge ${getMoodClass(entry.label)}`;
	}

	if (analysisText) {
		analysisText.textContent = entry.insight || "Analiz hazır.";
	}

	if (analysisScore) {
		analysisScore.textContent = `${Math.round((entry.score || 0) * 100)}%`;
	}

	if (analysisEnergy) {
		analysisEnergy.textContent = String(entry.energy ?? 0);
	}

	if (analysisStress) {
		analysisStress.textContent = String(entry.stress ?? 0);
	}

	if (suggestionList) {
		suggestionList.innerHTML = (entry.suggestions || []).map((item) => `<li>${item}</li>`).join("");
	}
}

function updateKPIs(entries) {
	updateStat("entry-count", entries.length);
	updateStat("streak-count", calcStreak(entries));
	updateStat("average-energy", calcAverage(entries, "energy"));
	updateStat("average-stress", calcAverage(entries, "stress"));
	updateStat("dominant-mood", calcDominantMood(entries));
}

async function renderAffirmation() {
	const affirmation = await getDailyAffirmation();
	const element = byId("daily-affirmation");
	if (element) {
		element.textContent = affirmation;
	}
}

// Gonderim akisi: analiz -> kaydet -> render -> grafik guncelle.
async function handleSubmit(event) {
	event.preventDefault();

	const textarea = byId("journal-text");
	const submitButton = byId("journal-submit");
	const text = textarea?.value.trim();

	if (!text) {
		return;
	}

	if (submitButton) {
		submitButton.disabled = true;
		submitButton.textContent = "Analiz ediliyor...";
	}

	try {
		const analysis = await analyzeJournal(text);
		const savedEntry = await saveJournalEntry(analysis);
		state.entries = [savedEntry, ...state.entries.filter((entry) => entry.id !== savedEntry.id)];
		renderSummary(savedEntry);
		renderHistory(state.entries);
		updateKPIs(state.entries);
		renderMoodCharts(state.entries);
		await renderAffirmation();

		if (textarea) {
			textarea.value = "";
		}
	} finally {
		if (submitButton) {
			submitButton.disabled = false;
			submitButton.textContent = "Analiz Et";
		}
	}
}

// UI kontrollerini localStorage ayarlarina bagla.
function wireProfileControls() {
	const profileName = byId("profile-name");
	const profileFocus = byId("profile-focus");
	const zenSoundToggle = byId("zen-sound-toggle");
	const autoZenToggle = byId("auto-zen-toggle");

	profileName?.addEventListener("input", () => {
		state.profile.name = profileName.value;
		saveStoredProfile(state.profile);
	});

	profileFocus?.addEventListener("change", () => {
		state.profile.focus = profileFocus.value;
		saveStoredProfile(state.profile);
	});

	zenSoundToggle?.addEventListener("change", () => {
		state.settings.zenSoundEnabled = zenSoundToggle.checked;
		saveStoredSettings(state.settings);
	});

	autoZenToggle?.addEventListener("change", () => {
		state.settings.autoZenOnStress = autoZenToggle.checked;
		saveStoredSettings(state.settings);
	});
}

function wireZenButton() {
	byId("open-zen-mode")?.addEventListener("click", () => {
		window.location.href = "/zen";
	});
}

// Dashboard sayfasi giris noktasi.
async function init() {
	const form = byId("journal-form");
	if (!form) {
		return;
	}

	renderProfile();
	wireProfileControls();
	wireZenButton();
	form.addEventListener("submit", handleSubmit);

	state.entries = await getJournalEntries();
	renderHistory(state.entries);
	renderSummary(state.entries[0] || {
		label: "dengeli",
		score: 0.5,
		energy: 60,
		stress: 30,
		insight: "Bugünün ilk analizini yaz.",
		suggestions: ["Günün nasıl geçtiğini birkaç cümleyle anlat."],
	});
	updateKPIs(state.entries);
	renderMoodCharts(state.entries);
	await renderAffirmation();
}

document.addEventListener("DOMContentLoaded", init);