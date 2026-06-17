// __tests__/respiration.utils.test.ts
import { describe, it, expect } from "vitest";
import {
	cloneExercise,
	canPlayExercise,
	getCircleAnimSize,
	getCircleAnimTimeTrans,
	getCircleAnimTimingFunc,
	getCircleAnimColor,
	computeNextPhaseIndex,
	exercises,
	type IExercise,
	type Phase,
} from "./Exercice.utils";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const phaseInspiration: Phase = { duration: 4, mode: "inspiration" };
const phaseExpiration: Phase = { duration: 8, mode: "expiration" };
const phaseTenir: Phase = { duration: 7, mode: "tenir" };

const exerciceComplet: IExercise = {
	id: 99,
	title: "Test exercice",
	description: "Desc",
	phases: [phaseInspiration, phaseTenir, phaseExpiration],
};

// ─────────────────────────────────────────────────────────────────────────────
// cloneExercise
// ─────────────────────────────────────────────────────────────────────────────

describe("cloneExercise", () => {
	it("exo-unit-30 : retourne un objet différent (deep copy)", () => {
		const clone = cloneExercise(exerciceComplet);
		expect(clone).not.toBe(exerciceComplet);
	});

	it("exo-unit-31 : les phases clonées sont des objets différents", () => {
		const clone = cloneExercise(exerciceComplet);
		clone.phases.forEach((phase, i) => {
			expect(phase).not.toBe(exerciceComplet.phases[i]);
		});
	});

	it("exo-unit-32 : les valeurs des phases sont identiques après clonage", () => {
		const clone = cloneExercise(exerciceComplet);
		expect(clone.phases).toEqual(exerciceComplet.phases);
	});

	it("exo-unit-33 : modifier le clone ne modifie pas l'original", () => {
		const clone = cloneExercise(exerciceComplet);
		clone.phases[0].duration = 99;
		expect(exerciceComplet.phases[0].duration).toBe(4);
	});

	it("exo-unit-34 : clone d'un exercice sans phases", () => {
		const vide: IExercise = { id: 0, title: "", description: "", phases: [] };
		const clone = cloneExercise(vide);
		expect(clone.phases).toEqual([]);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// canPlayExercise
// ─────────────────────────────────────────────────────────────────────────────

describe("canPlayExercise", () => {
	it("exo-unit-35 : retourne false si l'exercice est undefined", () => {
		expect(canPlayExercise(undefined)).toBe(false);
	});

	it("exo-unit-36 : retourne false si l'exercice n'a aucune phase", () => {
		const ex: IExercise = { ...exerciceComplet, phases: [] };
		expect(canPlayExercise(ex)).toBe(false);
	});

	it("exo-unit-37 : retourne false si une phase a une durée à 0", () => {
		const ex: IExercise = {
			...exerciceComplet,
			phases: [{ duration: 0, mode: "inspiration" }],
		};
		expect(canPlayExercise(ex)).toBe(false);
	});

	it("exo-unit-38 : retourne true pour un exercice valide avec plusieurs phases", () => {
		expect(canPlayExercise(exerciceComplet)).toBe(true);
	});

	it("exo-unit-39 : retourne true pour un exercice avec une seule phase valide", () => {
		const ex: IExercise = {
			...exerciceComplet,
			phases: [{ duration: 5, mode: "expiration" }],
		};
		expect(canPlayExercise(ex)).toBe(true);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// getCircleAnimSize
// ─────────────────────────────────────────────────────────────────────────────

describe("getCircleAnimSize", () => {
	it("exo-unit-40 : retourne 50% si aucune phase", () => {
		expect(getCircleAnimSize(undefined)).toBe("50%");
	});

	it("exo-unit-41 : retourne 100% en mode inspiration", () => {
		expect(getCircleAnimSize(phaseInspiration)).toBe("100%");
	});

	it("exo-unit-42 : retourne 0% en mode expiration", () => {
		expect(getCircleAnimSize(phaseExpiration)).toBe("0%");
	});

	it("exo-unit-43 : retourne 60% en mode tenir", () => {
		expect(getCircleAnimSize(phaseTenir)).toBe("60%");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// getCircleAnimTimeTrans
// ─────────────────────────────────────────────────────────────────────────────

describe("getCircleAnimTimeTrans", () => {
	it("exo-unit-44 : retourne 0ms si phase undefined", () => {
		expect(getCircleAnimTimeTrans(undefined, true)).toBe("0ms");
	});

	it("exo-unit-45 : retourne 0ms si isPlaying est false", () => {
		expect(getCircleAnimTimeTrans(phaseInspiration, false)).toBe("0ms");
	});

	it("exo-unit-46 : retourne durée * 1000 ms pour inspiration", () => {
		// 4 * 1000 = 4000ms
		expect(getCircleAnimTimeTrans(phaseInspiration, true)).toBe("4000ms");
	});

	it("exo-unit-47 : retourne durée * 1000 ms pour expiration", () => {
		// 8 * 1000 = 8000ms
		expect(getCircleAnimTimeTrans(phaseExpiration, true)).toBe("8000ms");
	});

	it("exo-unit-48 : retourne durée * 1000 / 3 ms pour tenir", () => {
		// (7 * 1000) / 3 ≈ 2333.33ms
		expect(getCircleAnimTimeTrans(phaseTenir, true)).toBe(
			`${(7 * 1000) / 3}ms`,
		);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// getCircleAnimTimingFunc
// ─────────────────────────────────────────────────────────────────────────────

describe("getCircleAnimTimingFunc", () => {
	it("exo-unit-49 : retourne linear si phase undefined", () => {
		expect(getCircleAnimTimingFunc(undefined, true)).toBe("linear");
	});

	it("exo-unit-50 : retourne linear si isPlaying est false", () => {
		expect(getCircleAnimTimingFunc(phaseTenir, false)).toBe("linear");
	});

	it("exo-unit-51 : retourne ease-out en mode tenir (isPlaying true)", () => {
		expect(getCircleAnimTimingFunc(phaseTenir, true)).toBe("ease-out");
	});

	it("exo-unit-52 : retourne linear en mode inspiration (isPlaying true)", () => {
		expect(getCircleAnimTimingFunc(phaseInspiration, true)).toBe("linear");
	});

	it("exo-unit-53 : retourne linear en mode expiration (isPlaying true)", () => {
		expect(getCircleAnimTimingFunc(phaseExpiration, true)).toBe("linear");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// getCircleAnimColor
// ─────────────────────────────────────────────────────────────────────────────

describe("getCircleAnimColor", () => {
	it("exo-unit-54 : retourne la couleur par défaut si phase undefined", () => {
		expect(getCircleAnimColor(undefined)).toBe("var(--color-primary-50)");
	});

	it("exo-unit-55 : retourne la couleur inspiration", () => {
		expect(getCircleAnimColor(phaseInspiration)).toBe(
			"var(--color-primary-300)",
		);
	});

	it("exo-unit-56 : retourne la couleur expiration", () => {
		expect(getCircleAnimColor(phaseExpiration)).toBe(
			"var(--color-primary-100)",
		);
	});

	it("exo-unit-57 : retourne la couleur tenir (secondary)", () => {
		expect(getCircleAnimColor(phaseTenir)).toBe("var(--color-secondary-500)");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// computeNextPhaseIndex
// ─────────────────────────────────────────────────────────────────────────────

describe("computeNextPhaseIndex", () => {
	it("exo-unit-58 : retourne 0 si totalPhases est 0", () => {
		expect(computeNextPhaseIndex(0, 0)).toBe(0);
	});

	it("exo-unit-59 : avance normalement au prochain index", () => {
		expect(computeNextPhaseIndex(0, 3)).toBe(1);
		expect(computeNextPhaseIndex(1, 3)).toBe(2);
	});

	it("exo-unit-60 : revient à 0 en fin de cycle (boucle)", () => {
		expect(computeNextPhaseIndex(2, 3)).toBe(0);
	});

	it("exo-unit-61 : fonctionne avec un seul exercice (boucle immédiate)", () => {
		expect(computeNextPhaseIndex(0, 1)).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Données des exercices codés en dur
// ─────────────────────────────────────────────────────────────────────────────

describe("exercises (données en dur)", () => {
	it("exo-unit-62 : l'exercice 1 (478) a 3 phases dans le bon ordre", () => {
		const ex = exercises["1"];
		expect(ex.phases).toHaveLength(3);
		expect(ex.phases[0].mode).toBe("inspiration");
		expect(ex.phases[1].mode).toBe("tenir");
		expect(ex.phases[2].mode).toBe("expiration");
	});

	it("exo-unit-63 : l'exercice 1 a les durées correctes (4-7-8)", () => {
		const ex = exercises["1"];
		expect(ex.phases[0].duration).toBe(4);
		expect(ex.phases[1].duration).toBe(7);
		expect(ex.phases[2].duration).toBe(8);
	});

	it("exo-unit-64 : l'exercice 2 (55) a 2 phases inspiration/expiration", () => {
		const ex = exercises["2"];
		expect(ex.phases).toHaveLength(2);
		expect(ex.phases[0].mode).toBe("inspiration");
		expect(ex.phases[1].mode).toBe("expiration");
	});

	it("exo-unit-65 : l'exercice 2 a les durées correctes (5-5)", () => {
		const ex = exercises["2"];
		expect(ex.phases[0].duration).toBe(5);
		expect(ex.phases[1].duration).toBe(5);
	});

	it("exo-unit-66 : l'exercice 3 (46) a les durées correctes (4-6)", () => {
		const ex = exercises["3"];
		expect(ex.phases[0].duration).toBe(4);
		expect(ex.phases[1].duration).toBe(6);
	});

	it("exo-unit-67 : tous les exercices sont jouables (canPlayExercise)", () => {
		Object.values(exercises).forEach((ex) => {
			expect(canPlayExercise(ex)).toBe(true);
		});
	});
});
