export type CheckAuthStatus = "refreshing" | "authenticated" | "unauthenticated";
export interface TokensAndOtherData {
	access_token: string;
	refresh_token: string;
};