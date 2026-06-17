"use client";

import { Card, Button, NumberInput, Select, SelectItem } from "@heroui/react";
import { Pause, PlayArrow, Stop } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Flex from "../components/utils/Flex";
import Title from "../components/utils/Title";
import useIsMobile from "@/context/useIsMobile";

type PhaseMode = "inspiration" | "expiration" | "tenir";

type Phase = {
	duration: number;
	mode: PhaseMode;
};

export type IExercise = {
	id: number;
	title: string;
	description: string;
	phases: Phase[];
};

const exercises: Record<string, IExercise> = {
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

const phaseModeLabels: Record<PhaseMode, string> = {
	inspiration: "Inspiration",
	expiration: "Expiration",
	tenir: "Tenir",
};

const cloneExercise = (exercise: IExercise): IExercise => ({
	...exercise,
	phases: exercise.phases.map((phase) => ({ ...phase })),
});

const playBeep = (frequency = 600, duration = 150) => {
	const audioCtx = new (window.AudioContext || window.AudioContext)();
	const oscillator = audioCtx.createOscillator();

	oscillator.type = "sine";
	oscillator.frequency.value = frequency;
	oscillator.connect(audioCtx.destination);

	oscillator.start();
	setTimeout(() => oscillator.stop(), duration);
};

export default function RespirationPage() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState<IExercise>();
	const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
	const [timeLeft, setTimeLeft] = useState(0);
	const [maxCycleTime, setMaxCycleTime] = useState(3);
	const [cycleCount, setCycleCount] = useState(0);

	const isMobile = useIsMobile();

	const currentPhase = selectedExercise?.phases[currentPhaseIndex];
	const canPlayExercise =
		!!selectedExercise &&
		selectedExercise.phases.length > 0 &&
		selectedExercise.phases.every((phase) => phase.duration > 0);

	const selectExercise = (exercise: IExercise) => {
		const editableExercise = cloneExercise(exercise);
		setSelectedExercise(editableExercise);
		setIsPlaying(false);
		setCurrentPhaseIndex(0);
		setTimeLeft(editableExercise.phases[0]?.duration ?? 0);
		setCycleCount(0);
	};

	const updatePhase = (index: number, updates: Partial<Phase>) => {
		setSelectedExercise((prev) => {
			if (!prev) return prev;
			const phases = prev.phases.map((phase, phaseIndex) => {
				if (phaseIndex !== index) return phase;
				return {
					...phase,
					...updates,
				};
			});

			return {
				...prev,
				phases,
			};
		});

		if (
			!isPlaying &&
			index === currentPhaseIndex &&
			typeof updates.duration === "number"
		) {
			setTimeLeft(Math.max(1, updates.duration));
		}
	};

	const addPhase = (mode: PhaseMode) => {
		setSelectedExercise((prev) => {
			if (!prev) return prev;
			const newPhase: Phase = {
				duration: 4,
				mode,
			};

			return {
				...prev,
				phases: [...prev.phases, newPhase],
			};
		});
	};

	const removePhase = (index: number) => {
		setSelectedExercise((prev) => {
			if (!prev) return prev;

			const updatedPhases = prev.phases.filter(
				(_, phaseIndex) => phaseIndex !== index,
			);

			if (updatedPhases.length === 0) {
				setIsPlaying(false);
				setCurrentPhaseIndex(0);
				setTimeLeft(0);
				setCycleCount(0);
			} else if (currentPhaseIndex >= updatedPhases.length) {
				setCurrentPhaseIndex(0);
				setTimeLeft(updatedPhases[0].duration);
			}

			return {
				...prev,
				phases: updatedPhases,
			};
		});
	};

	const resetCurrentExercise = () => {
		if (!selectedExercise) return;
		const originalExercise = exercises[selectedExercise.id.toString()];
		if (!originalExercise) return;

		const resetExercise = cloneExercise(originalExercise);
		setIsPlaying(false);
		setSelectedExercise(resetExercise);
		setCurrentPhaseIndex(0);
		setTimeLeft(resetExercise.phases[0]?.duration ?? 0);
		setCycleCount(0);
	};

	const stopExercise = () => {
		setIsPlaying(false);
		if (selectedExercise) {
			setCurrentPhaseIndex(0);
			setTimeLeft(selectedExercise.phases[0]?.duration ?? 0);
		}
		setCycleCount(0);
	};

	const handleTogglePlay = () => {
		if (!selectedExercise || !canPlayExercise) return;

		if (!isPlaying) {
			const safeIndex =
				currentPhaseIndex >= selectedExercise.phases.length
					? 0
					: currentPhaseIndex;
			setCurrentPhaseIndex(safeIndex);
			if (timeLeft <= 0 || safeIndex !== currentPhaseIndex) {
				setTimeLeft(selectedExercise.phases[safeIndex].duration);
			}
		}

		setIsPlaying((prev) => !prev);
	};

	useEffect(() => {
		if (!isPlaying || !selectedExercise || selectedExercise.phases.length === 0)
			return;
		const timer = setTimeout(() => {
			if (timeLeft > 1) {
				setTimeLeft((prev) => prev - 1);
			} else {
				const nextIndex =
					(currentPhaseIndex + 1) % selectedExercise.phases.length;
				if (nextIndex === 0) {
					console.log("Cycle count:", cycleCount + 1);
					if (cycleCount + 1 === maxCycleTime) {
						setIsPlaying(false);
						setCycleCount(0);
					} else {
						setCycleCount((prev) => prev + 1);
						playBeep(600, 250);
					}
				} else {
					playBeep();
				}
				setCurrentPhaseIndex(nextIndex);
				playBeep();
				setTimeLeft(selectedExercise.phases[nextIndex].duration);
			}
		}, 1000);
		return () => clearTimeout(timer);
	}, [
		isPlaying,
		timeLeft,
		selectedExercise,
		currentPhaseIndex,
		cycleCount,
		maxCycleTime,
	]);

	const getCircleAnimSize = () => {
		if (!currentPhase) return "50%";
		if (currentPhase.mode === "inspiration") return "100%";
		if (currentPhase.mode === "expiration") return "0%";
		return "60%";
	};

	const getCircleAnimTimeTrans = () => {
		if (!currentPhase || !isPlaying) return "0ms";
		if (currentPhase.mode === "tenir")
			return `${(currentPhase.duration * 1000) / 3}ms`;
		return `${currentPhase.duration * 1000}ms`;
	};

	const getCircleAnimTimingFunc = () => {
		if (!currentPhase || !isPlaying) return "linear";
		if (currentPhase.mode === "tenir") return "ease-out";
		return "linear";
	};

	const getCircleAnimColor = () => {
		if (!currentPhase) return "var(--color-primary-50)";
		if (currentPhase.mode === "tenir") return "var(--color-secondary-500)";
		if (currentPhase.mode === "inspiration") return "var(--color-primary-300)";
		if (currentPhase.mode === "expiration") return "var(--color-primary-100)";
		return "var(--color-primary-200)";
	};

	return (
		<Flex direction="column" gap className="max-w-6xl mx-auto w-full">
			<Title size="lg">Espace Respiration</Title>
			<p className="text-gray-600 mb-4">
				Sélectionnez un exercice et suivez le rythme pour vous détendre.
			</p>

			<Flex
				direction={isMobile ? "column" : "row"}
				gap="24px"
				fullWidth
				flexWrap="wrap"
			>
				{/* Liste des exercices */}
				<Card className="p-8 gap-4 flex-1 min-w-0">
					<Title size="sm" underline>
						Exercices disponibles :
					</Title>
					<Flex direction="column" gap="16px">
						{Object.values(exercises).map((ex) => (
							<Button
								key={ex.id}
								className={`h-auto flex-col items-start p-4 whitespace-normal text-left border transition-all ${selectedExercise?.id === ex.id ? "border-primary bg-primary-50" : "border-transparent bg-white hover:bg-gray-50"}`}
								onPress={() => selectExercise(ex)}
								variant="light"
							>
								<span className="font-bold text-lg text-primary-700 mb-1 w-full">
									{ex.title}
								</span>
								<span className="flex min-w-10 text-sm text-gray-500 w-full wrap-break-word">
									{ex.description}
								</span>
							</Button>
						))}
					</Flex>
					<Title size="sm" underline>
						Phases personnalisables :
					</Title>
					{!selectedExercise ? (
						<p className="text-gray-500 text-sm">
							Sélectionnez un exercice pour éditer ses phases.
						</p>
					) : (
						<Flex direction="column" gap="10px">
							{selectedExercise.phases.length === 0 ? (
								<p className="text-danger text-sm">
									Ajoutez au moins une phase pour pouvoir lancer
									l&apos;exercice.
								</p>
							) : (
								selectedExercise.phases.map((phase, index) => (
									<Card key={`${phase.mode}-${index}`} className="p-3 border">
										<Flex direction="column" gap="8px" className="w-full">
											<Flex
												direction={isMobile ? "column" : "row"}
												gap="8px"
												fullWidth
											>
												<Select
													label="Type"
													selectedKeys={[phase.mode]}
													onChange={(event) =>
														updatePhase(index, {
															mode: event.target.value as PhaseMode,
														})
													}
													variant="bordered"
													className="flex-1"
												>
													<SelectItem key="inspiration">Inspiration</SelectItem>
													<SelectItem key="expiration">Expiration</SelectItem>
													<SelectItem key="tenir">Tenir</SelectItem>
												</Select>
												<NumberInput
													label="Durée (s)"
													value={phase.duration}
													onChange={(value) =>
														updatePhase(index, {
															duration: Math.max(1, Number(value) || 1),
														})
													}
													min={1}
													max={60}
													className="flex-1"
												/>
											</Flex>
											<Flex justifyContent="flex-end">
												<Button
													color="danger"
													variant="light"
													onPress={() => removePhase(index)}
												>
													Supprimer
												</Button>
											</Flex>
										</Flex>
									</Card>
								))
							)}

							<Flex direction={isMobile ? "column" : "row"} gap="8px" fullWidth>
								<Button variant="flat" onPress={() => addPhase("inspiration")}>
									+ Inspiration
								</Button>
								<Button variant="flat" onPress={() => addPhase("expiration")}>
									+ Expiration
								</Button>
								<Button variant="flat" onPress={() => addPhase("tenir")}>
									+ Tenir
								</Button>
								<Button
									color="warning"
									variant="light"
									onPress={resetCurrentExercise}
								>
									Réinitialiser
								</Button>
							</Flex>
						</Flex>
					)}
					<Title size="sm" underline>
						Options :
					</Title>
					<Flex direction="column" gap="8px">
						<NumberInput
							label="Nombre de cycles"
							value={maxCycleTime}
							onChange={(value) => setMaxCycleTime(Number(value))}
							min={1}
							max={100}
						/>
					</Flex>
				</Card>

				{/* Zone visuelle et contrôles */}
				{!selectedExercise ? (
					<Flex
						justifyContent="center"
						alignItems="center"
						flex="1"
						className={`${!isMobile && "min-w-100"}`}
					>
						<p className="text-gray-400 text-lg">
							Sélectionnez un exercice pour commencer.
						</p>
					</Flex>
				) : (
					<Card
						className={`p-8 gap-4 flex-1 ${!isMobile ? "min-w-100" : ""}`}
						fullWidth
					>
						<Title size="sm" underline>
							{selectedExercise.title}
						</Title>
						<Flex
							direction="column"
							justifyContent="center"
							alignItems="center"
							gap="2rem"
						>
							<Flex className="top-8 left-0 right-0" justifyContent="center">
								<p className="text-primary-600 text-2xl font-extrabold">
									{currentPhase ? phaseModeLabels[currentPhase.mode] : ""}
								</p>
							</Flex>

							<Flex
								padding="2rem"
								justifyContent="center"
								alignItems="center"
								className="relative rounded-full bg-primary-50 border-4 border-primary-200 overflow-hidden"
							>
								<div
									className={`absolute rounded-full opacity-40`}
									style={{
										backgroundColor: getCircleAnimColor(),
										width: getCircleAnimSize(),
										height: getCircleAnimSize(),
										transitionDuration: `${getCircleAnimTimeTrans()}`,
										transitionTimingFunction: `${getCircleAnimTimingFunc()}`,
									}}
								/>
								<span className="text-4xl font-bold text-primary-800 z-10">
									{timeLeft}s
								</span>
							</Flex>

							<Flex gap="4rem">
								<Button
									isIconOnly
									className="w-16 h-16 rounded-full shadow-lg"
									color={isPlaying ? "warning" : "primary"}
									onPress={handleTogglePlay}
									isDisabled={!canPlayExercise}
								>
									{isPlaying ? <Pause /> : <PlayArrow />}
								</Button>
								<Button
									isIconOnly
									variant="flat"
									color="danger"
									className="w-16 h-16 rounded-full"
									onPress={stopExercise}
								>
									<Stop />
								</Button>
							</Flex>
						</Flex>
					</Card>
				)}
			</Flex>
		</Flex>
	);
}
