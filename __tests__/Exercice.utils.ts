// respiration.utils.ts
// Fonctions pures extraites de RespirationPage pour les tests unitaires

export type PhaseMode = "inspiration" | "expiration" | "tenir";

export type Phase = {
	duration: number;
	mode: PhaseMode;
};

export type IExercise = {
	id: number;
	title: string;
	description: string;
	phases: Phase[];
};

export const exercises: Record<string, IExercise> = {
	"1": {
		id: 1,
		title: "Exercice de relaxation profonde",
		description:
			"Utilisé pour l'endormissement ou réduire une forte anxiété en activant le système parasympathique.",
		phases: [
			{ duration: 4, mode: "inspiration" },
			{ duration: 7, mode: "tenir" },
			{ duration: 8, mode: "expiration" },
		],
	},
	"2": {
		id: 2,
		title: "Exercice d'équilibrage",
		description:
			"Utilisé pour stabiliser le rythme cardiaque et gérer le stress quotidien de manière neutre.",
		phases: [
			{ duration: 5, mode: "inspiration" },
			{ duration: 5, mode: "expiration" },
		],
	},
	"3": {
		id: 3,
		title: "Exercice de calme léger",
		description:
			"L'expiration prolongée favorise la détente sans l'intensité de l'apnée, idéal pour se recentrer rapidement.",
		phases: [
			{ duration: 4, mode: "inspiration" },
			{ duration: 6, mode: "expiration" },
		],
	},
};

export const cloneExercise = (exercise: IExercise): IExercise => ({
	...exercise,
	phases: exercise.phases.map((phase) => ({ ...phase })),
});

export const canPlayExercise = (exercise: IExercise | undefined): boolean => {
	if (!exercise) return false;
	if (exercise.phases.length === 0) return false;
	return exercise.phases.every((phase) => phase.duration > 0);
};

export const getCircleAnimSize = (currentPhase: Phase | undefined): string => {
	if (!currentPhase) return "50%";
	if (currentPhase.mode === "inspiration") return "100%";
	if (currentPhase.mode === "expiration") return "0%";
	return "60%"; // tenir
};

export const getCircleAnimTimeTrans = (
	currentPhase: Phase | undefined,
	isPlaying: boolean,
): string => {
	if (!currentPhase || !isPlaying) return "0ms";
	if (currentPhase.mode === "tenir")
		return `${(currentPhase.duration * 1000) / 3}ms`;
	return `${currentPhase.duration * 1000}ms`;
};

export const getCircleAnimTimingFunc = (
	currentPhase: Phase | undefined,
	isPlaying: boolean,
): string => {
	if (!currentPhase || !isPlaying) return "linear";
	if (currentPhase.mode === "tenir") return "ease-out";
	return "linear";
};

export const getCircleAnimColor = (currentPhase: Phase | undefined): string => {
	if (!currentPhase) return "var(--color-primary-50)";
	if (currentPhase.mode === "tenir") return "var(--color-secondary-500)";
	if (currentPhase.mode === "inspiration") return "var(--color-primary-300)";
	if (currentPhase.mode === "expiration") return "var(--color-primary-100)";
	return "var(--color-primary-200)";
};

export const computeNextPhaseIndex = (
	currentIndex: number,
	totalPhases: number,
): number => {
	if (totalPhases === 0) return 0;
	return (currentIndex + 1) % totalPhases;
};
