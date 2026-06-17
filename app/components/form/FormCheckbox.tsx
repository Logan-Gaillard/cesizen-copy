"use client";

import useIsMobile from "@/context/useIsMobile";
import { Checkbox } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

interface ICheckboxProps {
	name: string;
	defaultValue?: boolean;
	disabled?: boolean;
	label?: string;
	required?: boolean;
}

const FormCheckbox = ({
	name,
	defaultValue,
	disabled,
	label,
	required = true,
}: ICheckboxProps) => {
	const { control } = useFormContext();
	const isMobile = useIsMobile();
	return (
		<Controller
			control={control}
			rules={required ? { required: "Ce champ est requis" } : {}}
			render={({ field: { onChange, onBlur, value }, fieldState }) => (
				<Checkbox
					onBlur={onBlur}
					onValueChange={onChange}
					value={value}
					isInvalid={!!fieldState.error}
					required={required}
					size={isMobile ? "sm" : "md"}
				>
					{label}
				</Checkbox>
			)}
			name={name}
			defaultValue={defaultValue}
			disabled={disabled}
		/>
	);
};

export default FormCheckbox;
