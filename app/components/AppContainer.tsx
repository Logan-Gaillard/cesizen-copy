import React from "react";
import styled from "styled-components";

const SContainer = styled.div`
	width: 100%;
	height: calc(100% - 80px);
	overflow-y: auto;
`;

const AppContainer = ({ children }: { children: React.ReactNode }) => {
	return <SContainer className="p-8">{children}</SContainer>;
};

export default AppContainer;
