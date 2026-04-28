const STORAGE_KEYS = {
	profile: "mindflow.profile",
	settings: "mindflow.settings",
	journal: "mindflow.journal",
};

const FALLBACK_QUOTES = [
	"Bugün ne kadar küçük olursa olsun, tek bir adım yeterlidir.",
	"Sakinlik bir varış noktası değil, tekrar tekrar seçilen bir ritimdir.",
	"Duygular geçer, farkındalık kalır.",
	"Kendine nazik davrandığın her an iyileşmenin parçasıdır.",
];

export const apiConfig = {
	baseUrl: getBaseUrl(),
};

function getBaseUrl() {
	if (typeof window === "undefined") {
		return "http://localhost:8000";
	}

	const meta = document.querySelector('meta[name="mindflow-api-url"]');
	if (meta?.content) {
		return meta.content;
	}

	if (window.location.protocol === "file:") {
		return "http://localhost:8000";
	}

	return `${window.location.protocol}//${window.location.host}`;
}

function readJson(key, fallbackValue) {
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallbackValue;
	} catch {
		return fallbackValue;
	}
}

function writeJson(key, value) {
	window.localStorage.setItem(key, JSON.stringify(value));
}

function buildUrl(path) {
	if (/^https?:\/\//i.test(path)) {
		return path;
	}
	return `${apiConfig.baseUrl}${path}`;
}

async function request(path, options = {}, fallbackFactory) {
	try {
		const response = await fetch(buildUrl(path), {
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {}),
			},
			...options,
		});

		if (!response.ok) {
			throw new Error(`Request failed with ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		if (typeof fallbackFactory === "function") {
			return fallbackFactory(error);
		}
		throw error;
	}
}

export function getStoredProfile() {
	return readJson(STORAGE_KEYS.profile, {
		name: "",
		focus: "genel",
		remindersEnabled: true,
	});
}

export function saveStoredProfile(profile) {
	writeJson(STORAGE_KEYS.profile, profile);
	return profile;
}

export function getStoredSettings() {
	return readJson(STORAGE_KEYS.settings, {
		zenSoundEnabled: true,
		autoZenOnStress: true,
		compactMode: false,
	});
}

export function saveStoredSettings(settings) {
	writeJson(STORAGE_KEYS.settings, settings);
	return settings;
}

export function getLocalJournalEntries() {
	return readJson(STORAGE_KEYS.journal, []);
}

export function saveLocalJournalEntries(entries) {
	writeJson(STORAGE_KEYS.journal, entries);
	return entries;
}

function getKeywordScore(text, words) {
	return words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
}

function analyzeLocally(text) {
	const normalized = text.toLowerCase();
	const signals = {
		mutlu: getKeywordScore(normalized, ["mutlu", "iyi", "güzel", "harika", "heyecan", "sevin", "başard"]),
		üzgün: getKeywordScore(normalized, ["üzgün", "kırgın", "mutsuz", "yalnız", "ağlad", "umutsuz"]),
		stresli: getKeywordScore(normalized, ["stres", "kayg", "endiş", "panik", "gergin", "baskı", "bunald"]),
		dengeli: getKeywordScore(normalized, ["rahat", "sakin", "huzur", "nefes", "dengeli", "toparland"]),
	};

	const dominant = Object.entries(signals).sort((left, right) => right[1] - left[1])[0][0];
	const score = Math.max(0.15, Math.min(0.98, (signals[dominant] + 1) / Math.max(3, text.split(/\s+/).length)));
	const energyMap = { mutlu: 84, üzgün: 34, stresli: 41, dengeli: 68 };
	const stressMap = { mutlu: 18, üzgün: 72, stresli: 87, dengeli: 29 };

	const insightMap = {
		mutlu: "Metin pozitif ve akışkan bir ruh hali gösteriyor.",
		üzgün: "Metin kırılganlık ve duygusal yük sinyalleri taşıyor.",
		stresli: "Metin baskı, gerginlik veya hızlı düşünme göstergeleri içeriyor.",
		dengeli: "Metin sakin, dengeli ve toparlayıcı bir ton taşıyor.",
	};

	const suggestionMap = {
		mutlu: ["Bu enerjiyi korumak için iyi hissettiren bir anı not et.", "Kısa bir yürüyüşle bu hissi bedene yay."],
		üzgün: ["Kendine bugün tek bir küçük iyilik yap.", "Nefesi 4-4-6 ritmiyle üç tur tekrar et."],
		stresli: ["Gözlerini kapatıp omuzlarını gevşet.", "Bugünün en küçük işini seç ve sadece onu bitir."],
		dengeli: ["Bu sakinliği korumak için bir su molası ver.", "Günün sonunda minnettarlık notu ekle."],
	};

	return {
		label: dominant,
		score: Number(score.toFixed(2)),
		energy: energyMap[dominant],
		stress: stressMap[dominant],
		insight: insightMap[dominant],
		suggestions: suggestionMap[dominant],
		breakdown: signals,
		created_at: new Date().toISOString(),
	};
}

function normalizeJournalEntry(entry) {
	return {
		id: entry.id || entry.created_at || crypto.randomUUID(),
		text: entry.text || "",
		label: entry.label || entry.emotion || "dengeli",
		score: Number(entry.score ?? 0.5),
		energy: Number(entry.energy ?? 60),
		stress: Number(entry.stress ?? 30),
		insight: entry.insight || "",
		suggestions: entry.suggestions || [],
		breakdown: entry.breakdown || {},
		created_at: entry.created_at || entry.createdAt || new Date().toISOString(),
	};
}

export async function analyzeJournal(text) {
	const normalizedText = String(text || "").trim();
	if (!normalizedText) {
		throw new Error("Metin boş olamaz.");
	}

	const result = await request("/api/emotion/analyze", {
		method: "POST",
		body: JSON.stringify({ text: normalizedText }),
	}, () => analyzeLocally(normalizedText));

	return {
		text: normalizedText,
		...analyzeLocally(normalizedText),
		...result,
	};
}

export async function saveJournalEntry(entry) {
	const normalizedEntry = normalizeJournalEntry(entry);

	const saved = await request("/api/journal", {
		method: "POST",
		body: JSON.stringify(normalizedEntry),
	}, () => ({ ...normalizedEntry, id: normalizedEntry.id || crypto.randomUUID() }));

	const currentEntries = getLocalJournalEntries();
	const mergedEntries = [normalizeJournalEntry(saved), ...currentEntries.filter((item) => item.id !== saved.id)];
	saveLocalJournalEntries(mergedEntries);

	return normalizeJournalEntry(saved);
}

export async function getJournalEntries() {
	const response = await request("/api/journal", {}, () => ({ items: getLocalJournalEntries() }));
	const items = Array.isArray(response) ? response : response.items || [];
	const normalized = items.map(normalizeJournalEntry);
	saveLocalJournalEntries(normalized);
	return normalized;
}

function buildLocalAffirmation(entries) {
	const labels = entries.slice(0, 7).map((entry) => entry.label);

	if (labels.filter((item) => item === "stresli").length >= 3) {
		return "Bugün yükün ağır görünse de tek bir sakin nefes bile ritmini değiştirir.";
	}

	if (labels.filter((item) => item === "üzgün").length >= 2) {
		return "Zorlanman değerini azaltmaz. Bugün kendine daha yumuşak davran.";
	}

	if (labels.filter((item) => item === "mutlu").length >= 2) {
		return "Bugünün güzel taraflarını fark et. İyi hisler çoğaldıkça daha görünür olur.";
	}

	return "Dengeyi araman bile bir ilerlemedir. Bugün kendine nazik kal.";
}

export async function getDailyAffirmation() {
	const response = await request("/api/affirmation/today", {}, () => ({ affirmation: buildLocalAffirmation(getLocalJournalEntries()) }));
	return response.affirmation || buildLocalAffirmation(getLocalJournalEntries());
}

export async function getZenQuote() {
	const response = await request("/api/affirmation/today", {}, () => ({ affirmation: FALLBACK_QUOTES[0] }));
	return response.affirmation || FALLBACK_QUOTES[0];
}

export function getFallbackZenQuote(index = 0) {
	return FALLBACK_QUOTES[index % FALLBACK_QUOTES.length];
}

export function mergeJournalEntries(newEntries) {
	const known = getLocalJournalEntries();
	const merged = [...newEntries.map(normalizeJournalEntry), ...known];
	const uniqueById = new Map();

	merged.forEach((entry) => {
		uniqueById.set(entry.id, entry);
	});

	const list = Array.from(uniqueById.values()).sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
	saveLocalJournalEntries(list);
	return list;
}