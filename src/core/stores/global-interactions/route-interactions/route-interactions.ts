import { makeAutoObservable } from 'mobx';

type Route = { name: string; params: any; };

const MAX_ROUTE_HISTORY_LENGTH = 10;

class RouteInteractions {
	constructor() { makeAutoObservable(this); }

	routeHistory: Route[] = [];

	pushRoute = (route: Route) => {
		if (this.routeHistory.length > MAX_ROUTE_HISTORY_LENGTH) this.routeHistory.shift();

		this.routeHistory.push(route);
	};

	popRoute = () => {
		this.routeHistory.pop();
	};

	clearRouteHistory = () => {
		this.routeHistory = [];
	};

	getRouteHistory = () => {
		return this.routeHistory;
	};

	getLastRoute = () => {
		return this.routeHistory[this.routeHistory.length - 1];
	};

	getPreLastRoute = () => {
		return this.routeHistory[this.routeHistory.length - 2];
	};
}

export const routeInteractions = new RouteInteractions();