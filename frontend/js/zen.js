// Zen modu: nefes animasyonu + ortam sesi.
import { getFallbackZenQuote, getZenQuote, getStoredSettings } from "./api.js";

// Zen modu kontrolleri icin runtime state.
const state = {
	audioContext: null,
	oscillators: [],
	timer: null,
	running: false,
	phaseIndex: 0,
	settings: getStoredSettings(),
};

// Nefes al/tut/ver/dinlen dongusu icin sureli fazlar.
const breathPhases = [
	{ label: "Nefes Al", duration: 4000, scale: 1.08 },
	{ label: "Tut", duration: 2500, scale: 1.08 },
	{ label: "Nefes Ver", duration: 5000, scale: 0.94 },
	{ label: "Dinlen", duration: 1800, scale: 1.0 },
];

function byId(id) {
	return document.getElementById(id);
}

function setPhase(phaseIndex) {
	const phase = breathPhases[phaseIndex % breathPhases.length];
	const phaseLabel = byId("breath-phase");
	const phaseHint = byId("breath-hint");
	const circle = byId("breath-circle");

	if (phaseLabel) {
		phaseLabel.textContent = phase.label;
	}
	if (phaseHint) {
		phaseHint.textContent = phase.duration >= 4000 ? "Burnundan yavaşça içeri al." : "Ritmi bırak, bedenin izin versin.";
	}
	if (circle) {
		circle.style.setProperty("--breath-scale", String(phase.scale));
		circle.classList.remove("phase-in", "phase-hold", "phase-out", "phase-rest");
		circle.classList.add(phaseIndex === 0 ? "phase-in" : phaseIndex === 1 ? "phase-hold" : phaseIndex === 2 ? "phase-out" : "phase-rest");
	}
}

// Timer ile nefes fazlarini dondurur.
function scheduleBreathing() {
	if (state.timer) {
		window.clearTimeout(state.timer);
	}

	const advance = () => {
		setPhase(state.phaseIndex);
		const phase = breathPhases[state.phaseIndex % breathPhases.length];
		state.phaseIndex = (state.phaseIndex + 1) % breathPhases.length;
		state.timer = window.setTimeout(advance, phase.duration);
	};

	advance();
}

// WebAudio ile yumusak ortam sesi uretir.
function createAmbientSound() {
	if (state.audioContext || !state.settings.zenSoundEnabled) {
		return;
	}

	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextClass) {
		return;
	}

	const audioContext = new AudioContextClass();
	const master = audioContext.createGain();
	const lowPass = audioContext.createBiquadFilter();
	lowPass.type = "lowpass";
	lowPass.frequency.value = 420;
	master.gain.value = 0.03;

	const oscillators = [174, 285].map((frequency) => {
		const oscillator = audioContext.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.value = frequency;
		oscillator.connect(lowPass);
		oscillator.start();
		return oscillator;
	});

	lowPass.connect(master);
	master.connect(audioContext.destination);

	state.audioContext = audioContext;
	state.oscillators = oscillators;
}

function stopAmbientSound() {
	state.oscillators.forEach((oscillator) => {
		try {
			oscillator.stop();
		} catch {
			// ignored because the oscillator may already be stopped
		}
	});

	if (state.audioContext) {
		state.audioContext.close();
	}

	state.audioContext = null;
	state.oscillators = [];
}

// Nefes dongusunu baslat/duraklat.
async function toggleZen() {
	const button = byId("zen-toggle");
	const status = byId("zen-status");

	state.running = !state.running;

	if (state.running) {
		scheduleBreathing();
		createAmbientSound();
		if (button) button.textContent = "Duraklat";
		if (status) status.textContent = "Zen modu aktif";
	} else {
		if (state.timer) {
			window.clearTimeout(state.timer);
			state.timer = null;
		}
		stopAmbientSound();
		if (button) button.textContent = "Başlat";
		if (status) status.textContent = "Zen modu hazır";
	}
}

// Zen ekrani icin sakinlestirici alinti/olumlama ceker.
async function renderZenQuote() {
	const quoteElement = byId("zen-quote");
	if (!quoteElement) {
		return;
	}

	try {
		quoteElement.textContent = await getZenQuote();
	} catch {
		quoteElement.textContent = getFallbackZenQuote();
	}
}

function wireControls() {
	byId("zen-toggle")?.addEventListener("click", toggleZen);
	byId("zen-exit")?.addEventListener("click", () => {
		window.location.href = "/app";
	});
	byId("zen-sound")?.addEventListener("change", (event) => {
		state.settings.zenSoundEnabled = Boolean(event.target.checked);
		if (!state.settings.zenSoundEnabled) {
			stopAmbientSound();
		} else if (state.running) {
			createAmbientSound();
		}
	});
}

// Zen sayfasi giris noktasi.
async function initZenPage() {
	wireControls();
	await renderZenQuote();
	setPhase(0);

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		const status = byId("zen-status");
		if (status) {
			status.textContent = "Animasyonlar azaltıldı";
		}
		return;
	}

	state.running = true;
	const button = byId("zen-toggle");
	if (button) {
		button.textContent = "Duraklat";
	}
	scheduleBreathing();
	if (state.settings.zenSoundEnabled) {
		createAmbientSound();
	}
}

document.addEventListener("DOMContentLoaded", initZenPage);