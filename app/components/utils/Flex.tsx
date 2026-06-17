"use client";

import React from "react";
import styled from "styled-components";

interface IFlexProps {
	display?: "flex" | "inline-flex";
	children: React.ReactNode;
	direction?: "row" | "column";
	gap?: string | boolean;
	padding?: string;
	justifyContent?:
		| "flex-start"
		| "center"
		| "flex-end"
		| "space-between"
		| "space-around"
		| "space-evenly";
	alignItems?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
	flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
	alignContent?:
		| "flex-start"
		| "center"
		| "flex-end"
		| "stretch"
		| "space-between"
		| "space-around";
	flex?: string;
	flexGrow?: number;
	flexShrink?: number;
	flexBasis?: string;
	fullWidth?: boolean;
	fullHeight?: boolean;
	grow?: boolean;
}

const Flex = styled.div.withConfig({
	shouldForwardProp: (prop) =>
		![
			"display",
			"direction",
			"gap",
			"justifyContent",
			"alignItems",
			"flexWrap",
			"alignContent",
			"flex",
			"flexGrow",
			"flexShrink",
			"flexBasis",
			"fullWidth",
			"fullHeight",
			"grow",
		].includes(prop),
})<IFlexProps>`
	display: ${(props) => props.display || "flex"};
	${(props) => props.direction && `flex-direction: ${props.direction};`}
	${(props) => props.gap && `gap: ${props.gap === true ? "1rem" : props.gap};`}
	${(props) => props.padding && `padding: ${props.padding};`}
	${(props) => props.justifyContent && `justify-content: ${props.justifyContent};`}
	${(props) => props.alignItems && `align-items: ${props.alignItems};`}
	${(props) => props.flexWrap && `flex-wrap: ${props.flexWrap};`}
	${(props) => props.alignContent && `align-content: ${props.alignContent};`}
	${(props) => props.flex && `flex: ${props.flex};`}
	${(props) => props.flexGrow !== undefined && `flex-grow: ${props.flexGrow};`}
	${(props) => props.flexShrink !== undefined && `flex-shrink: ${props.flexShrink};`}
	${(props) => props.flexBasis && `flex-basis: ${props.flexBasis};`}
	${(props) => props.fullWidth && `width: 100%;`}
	${(props) => props.fullHeight && `height: 100%;`}
	${(props) => props.grow && `flex-grow: 1;`}
`;

export default Flex;
