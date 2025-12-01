import { makeAutoObservable } from 'mobx';
import { RequestHistoryItem, RequestResponsePair } from './types';

export class DebugHistory {
	public history: RequestHistoryItem[] = [];
	public pairs: RequestResponsePair[] = [];
	private pendingRequests = new Map<string, RequestHistoryItem>();

	constructor() {
		makeAutoObservable(this);
	}

	addRequest(
		url: string,
		method: string,
		data?: any,
		cached = false,
		cacheKey?: string,
		requestId?: string,
		forceFetch?: boolean,
		noPending?: boolean,
		takePath?: string
	) {
		const methodUrl = `${method} ${url}`;

		const lastPair = this.pairs[0];
		const dataString = JSON.stringify(data);

		if (lastPair &&
			lastPair.methodUrl === methodUrl &&
			lastPair.cached === cached &&
			JSON.stringify(lastPair.request.data) === dataString
		) {
			if (lastPair.response) {
				lastPair.repeatCount++;
				lastPair.lastRepeatTimestamp = Date.now();
				console.log(`[DebugHistory] Stacked repeat request for ${methodUrl}, count: ${lastPair.repeatCount}`);
			} else {
				console.log(`[DebugHistory] Request ${methodUrl} already pending, skipping duplicate`);
			}

			if (requestId) {
				this.pendingRequests.set(requestId, lastPair.request);
			}
			return;
		}

		const request: RequestHistoryItem = {
			id: `req_${Date.now()}_${Math.random()}`,
			timestamp: Date.now(),
			type: 'request',
			url,
			method,
			data,
			cached,
			cacheKey,
			requestId,
		};

		this.history.unshift(request);

		const pair: RequestResponsePair = {
			id: `pair_${Date.now()}_${Math.random()}`,
			request,
			methodUrl,
			timestamp: Date.now(),
			cached,
			forceFetch,
			noPending,
			takePath,
			repeatCount: 1,
			lastRepeatTimestamp: Date.now(),
		};

		this.pairs.unshift(pair);

		if (requestId) {
			this.pendingRequests.set(requestId, request);
			console.log(`[DebugHistory] Created request with ID: ${requestId}, url: ${methodUrl}`);
		} else {
			this.pendingRequests.set(request.id, request);
			console.log(`[DebugHistory] Created request with local ID: ${request.id}, url: ${methodUrl}`);
		}

		this.limitSize();
	}

	addResponse(data: any, error?: any, cached = false, requestId?: string) {
		const response: RequestHistoryItem = {
			id: `res_${Date.now()}_${Math.random()}`,
			timestamp: Date.now(),
			type: 'response',
			data,
			error,
			cached,
			requestId,
		};

		this.history.unshift(response);

		let pairIndex = -1;
		if (requestId) {
			pairIndex = this.pairs.findIndex(pair =>
				pair.request.requestId === requestId && !pair.response
			);

			if (pairIndex === -1) {
				pairIndex = this.pairs.findIndex(pair =>
					pair.request.requestId === requestId
				);
			}

			console.log(`[DebugHistory] Looking for request with ID ${requestId}, found index: ${pairIndex}, pairs count: ${this.pairs.length}`);
		}

		if (pairIndex !== -1) {
			const foundPair = this.pairs[pairIndex];

			if (foundPair.response) {
				const existingResponseData = JSON.stringify(foundPair.response.data);
				const newResponseData = JSON.stringify(response.data);

				if (existingResponseData !== newResponseData) {
					foundPair.response = response;
					foundPair.lastRepeatTimestamp = Date.now();
					console.log(`[DebugHistory] ✅ Updated response for ${foundPair.methodUrl}`);
				} else {
					console.log(`[DebugHistory] ⚠️ Ignoring duplicate response for ${foundPair.methodUrl}`);
				}
			} else {
				foundPair.response = response;
				foundPair.cached = foundPair.cached || cached;
				console.log(`[DebugHistory] ✅ Attached response to ${foundPair.methodUrl}`);
			}

			if (requestId) {
				this.pendingRequests.delete(requestId);
			} else {
				this.pendingRequests.delete(foundPair.request.id);
			}
		} else {
			console.log(`[DebugHistory] ⚠️ No matching request found for response with ID ${requestId}`);
		}

		this.limitSize();
	}

	addCachedRequest(
		url: string,
		method: string,
		data?: any,
		cacheKey?: string,
		cachedResponse?: any,
		localCached?: boolean,
		forceFetch?: boolean,
		noPending?: boolean,
		takePath?: string
	) {
		const methodUrl = `${method} ${url}`;

		const lastPair = this.pairs[0];
		const dataString = JSON.stringify(data);
		const responseString = JSON.stringify(cachedResponse);

		if (lastPair &&
			lastPair.methodUrl === methodUrl &&
			lastPair.cached === true &&
			lastPair.localCached === localCached &&
			JSON.stringify(lastPair.request.data) === dataString &&
			lastPair.response &&
			JSON.stringify(lastPair.response.data) === responseString
		) {
			lastPair.repeatCount++;
			lastPair.lastRepeatTimestamp = Date.now();
			const cacheType = localCached ? 'LOCAL-CACHED' : 'CACHED';
			console.log(`[DebugHistory] Stacked repeat ${cacheType} request for ${methodUrl}, count: ${lastPair.repeatCount}`);
			return;
		}

		const fakeRequestId = `cached_${Date.now()}_${Math.random()}`;
		const request: RequestHistoryItem = {
			id: `req_cached_${Date.now()}_${Math.random()}`,
			timestamp: Date.now(),
			type: 'request',
			url,
			method,
			data,
			cached: true,
			cacheKey,
			requestId: fakeRequestId,
		};

		const response: RequestHistoryItem = {
			id: `res_cached_${Date.now()}_${Math.random()}`,
			timestamp: Date.now(),
			type: 'response',
			data: cachedResponse,
			cached: true,
			requestId: fakeRequestId,
		};

		this.history.unshift(response);
		this.history.unshift(request);

		const pair: RequestResponsePair = {
			id: `pair_cached_${Date.now()}_${Math.random()}`,
			request,
			response: cachedResponse ? response : undefined,
			methodUrl,
			timestamp: Date.now(),
			cached: true,
			localCached,
			forceFetch,
			noPending,
			takePath,
			repeatCount: 1,
			lastRepeatTimestamp: Date.now(),
		};

		this.pairs.unshift(pair);
		console.log(`[DebugHistory] Created cached request pair for ${methodUrl}`);

		this.limitSize();
	}

	private limitSize() {
		if (this.history.length > 100) {
			this.history = this.history.slice(0, 100);
		}
		if (this.pairs.length > 50) {
			this.pairs = this.pairs.slice(0, 50);
		}
	}

	clear() {
		this.history = [];
		this.pairs = [];
		this.pendingRequests.clear();
	}
}

