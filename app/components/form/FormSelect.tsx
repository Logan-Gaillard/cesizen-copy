"use client";

import useIsMobile from "@/context/useIsMobile";
import { Select, SelectItem } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

interface IFormSelectProps {
	name: string;
	items: {
		key: string;
		value: string;
	}[];
	defaultValue?: string;
	disabled?: boolean;
	placeholder?: string;
	label?: string;
	required?: boolean;
}

const FormSelect = ({
	name,
	items,
	defaultValue,
	disabled,
	placeholder,
	label,
	required = true,
}: IFormSelectProps) => {
	const { control } = useFormContext();
	const isMobile = useIsMobile();

	return (
		<Controller
			control={control}
			rules={{
				required: required ? "Ce champ est requis" : false,
			}}
			render={({ field: { onChange, onBlur, value }, fieldState }) => (
				<Select
					label={label}
					placeholder={placeholder}
					onBlur={onBlur}
					onChange={onChange}
					value={value}
					errorMessage={fieldState.error?.message}
					isInvalid={!!fieldState.error}
					required={required}
					size={isMobile ? "sm" : "md"}
					variant="bordered"
				>
					{items.map((item) => (
						<SelectItem key={item.key}>{item.value}</SelectItem>
					))}
				</Select>
			)}
			name={name}
			defaultValue={defaultValue}
			disabled={disabled}
		/>
	);
};

export default FormSelect;
