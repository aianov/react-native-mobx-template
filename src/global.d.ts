declare module "*.module.scss" {
	const classes: { [key: string]: string; };
	export default classes;
}

declare module '*.jpg' {
	const value: string;
	export default value;
}

declare module '*.png' {
	const value: string;
	export default value;
}

declare module '*.svg' {
	const value: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
	export default value;
}

declare module '*.gif' {
	const value: string;
	export default value;
}

declare module '*.webp' {
	const value: string;
	export default value;
}

declare module '*.jpeg' {
	const value: string;
	export default value;
}

declare module '@env' {
	export const API_BASE_URL: string;
	export const NODE_ENV: string;
	export const PROJECT_STATUS: string;
}