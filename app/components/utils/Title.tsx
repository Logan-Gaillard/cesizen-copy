interface TitleProps {
	children: React.ReactNode;
	className?: string;
	size: "sm" | "md" | "lg";
	underline?: boolean;
}

const Title = ({
	children,
	className,
	size = "md",
	underline = false,
}: TitleProps) => {
	const getSize = (): string => {
		switch (size) {
			case "sm":
				return "text-xl";
			case "md":
				return "text-2xl";
			case "lg":
				return "text-3xl";
			default:
				return "text-2xl";
		}
	};

	return (
		<div>
			<p
				className={`${getSize()} font-extrabold text-primary-800 tracking-tight ${className}`}
			>
				{children}
			</p>
			{underline && (
				<div className={`h-1 w-20 bg-secondary-300 rounded-full mt-2`} />
			)}
		</div>
	);
};

export default Title;
