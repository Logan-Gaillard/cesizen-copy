"use client";

import useIsMobile from "@/context/useIsMobile";
import { Textarea } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

interface ITextAreaProps {
	type: "email" | "password" | "text";
	name: string;
	defaultValue?: string;
	disabled?: boolean;
	placeholder?: string;
	label?: string;
	required?: boolean;
}

const mailRules = {
	required: "L'email est requis",
	pattern: {
		value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		message: "L'email doit être valide",
	},
};

const passwordRules = {
	required: "Le mot de passe est requis",
	minLength: {
		value: 8,
		message: "Le mot de passe doit contenir au moins 8 caractères",
	},
	pattern: {
		value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$/\\%^&*])/,
		message:
			"Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial",
	},
};

const getRules = (type: string, required?: boolean) => {
	switch (type) {
		case "email":
			return required ? mailRules : { ...mailRules, required: false };
		case "password":
			return required ? passwordRules : { ...passwordRules, required: false };
		default:
			return required ? { required: "Ce champ est requis" } : {};
	}
};

const FormTextArea = ({
	type,
	name,
	defaultValue,
	disabled,
	placeholder,
	label,
	required = true,
}: ITextAreaProps) => {
	const { control } = useFormContext();
	const isMobile = useIsMobile();

	// Mappe les noms de champs aux valeurs autoComplete reconnues par les navigateurs
	const getAutoCompleteValue = (
		fieldName: string,
		fieldType: string,
	): string => {
		if (fieldType === "email") return "email";
		if (fieldType === "password") return "current-password";
		if (fieldName === "nickname") return "username";
		return "off";
	};

	return (
		<Controller
			control={control}
			rules={getRules(type, required)}
			render={({ field: { onChange, onBlur, value }, fieldState }) => (
				<Textarea
					label={label}
					placeholder={placeholder}
					onBlur={onBlur}
					onValueChange={onChange}
					value={value}
					type={type}
					errorMessage={fieldState.error?.message}
					isInvalid={!!fieldState.error}
					required={required}
					variant="bordered"
					autoComplete={getAutoCompleteValue(name, type)}
					size={isMobile ? "sm" : "md"}
					classNames={{ label: "text-xs" }}
				/>
			)}
			name={name}
			defaultValue={defaultValue}
			disabled={disabled}
		/>
	);
};

export default FormTextArea;
