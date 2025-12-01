import { ReactIcon } from '@animations/components/ReactIcon';
import { Box, SimpleButtonUi } from '@core/ui';
import { CopyMsgIcon } from '@icons/Ui/CopyMsgIcon';
import { getLogColor, logger, storeLogger } from '@lib/helpers';
import { RequestResponsePair } from '@lib/mobx-toolbox';
import { RouteProp } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { localStorage } from '@storage/index';
import { routeInteractions } from '@stores/global-interactions';
import * as Clipboard from 'expo-clipboard';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent
} from 'react-native-gesture-handler';
import Animated, {
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated';
import { findArrayKeysDeep } from '../obj';
import { formatDiffData } from '../text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = 50;
const MENU_WIDTH = SCREEN_WIDTH - 40;
const MENU_HEIGHT = 700;

export const DebuggerUi = observer(() => {
	const { globalHttpManager } = require('@core/lib/mobx-toolbox/mobxSaiFetch/global-http-manager');
	const { requestCache } = globalHttpManager;

	const [isMenuVisible, setIsMenuVisible] = useState(false);
	const [activeTab, setActiveTab] = useState<'history' | 'cache' | 'images' | 'localStorage' | 'storageCache' | 'logger' | 'events' | 'cacheUpdates'>('history');
	const [localStorageData, setLocalStorageData] = useState<any[]>([]);
	const [storageCacheData, setStorageCacheData] = useState<any[]>([]);
	const [imageData, setImageData] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [showSearchMatches, setShowSearchMatches] = useState(false);
	const [searchMatches, setSearchMatches] = useState<any[]>([]);
	const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
	const [logFz, setLogFz] = useState(10);
	const [fetchesFz, setFetchesFz] = useState(10);
	const [cacheFz, setCacheFz] = useState(10);
	const [localStorageFz, setLocalStorageFz] = useState(10);
	const [storageCacheFz, setStorageCacheFz] = useState(10);
	const [cacheUpdatesFz, setCacheUpdatesFz] = useState(10);

	const translateX = useSharedValue(SCREEN_WIDTH - CIRCLE_SIZE - 20);
	const translateY = useSharedValue(SCREEN_HEIGHT / 2);
	const scale = useSharedValue(1);

	const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
		onStart: () => {
			scale.value = withSpring(1.1);
		},
		onActive: (event) => {
			translateX.value = event.absoluteX - CIRCLE_SIZE / 2;
			translateY.value = event.absoluteY - CIRCLE_SIZE / 2;
		},
		onEnd: () => {
			scale.value = withSpring(1);

			if (translateX.value < SCREEN_WIDTH / 2) {
				translateX.value = withSpring(20);
			} else {
				translateX.value = withSpring(SCREEN_WIDTH - CIRCLE_SIZE - 20);
			}

			if (translateY.value < 50) {
				translateY.value = withSpring(50);
			} else if (translateY.value > SCREEN_HEIGHT - CIRCLE_SIZE - 100) {
				translateY.value = withSpring(SCREEN_HEIGHT - CIRCLE_SIZE - 100);
			}
		},
	});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: translateX.value },
			{ translateY: translateY.value },
			{ scale: scale.value },
		],
	}));

	const openMenu = async () => {
		setIsMenuVisible(true);
		if (activeTab === 'localStorage') {
			await loadLocalStorageData();
		} else if (activeTab === 'storageCache') {
			await loadStorageCacheData();
		} else if (activeTab === 'images') {
			await loadImageData();
		}
	};

	const closeMenu = () => {
		setIsMenuVisible(false);
	};

	const loadLocalStorageData = async () => {
		try {
			const keys = await localStorage.getAllKeys();
			const data = [];

			for (const key of keys) {
				try {
					if (key.startsWith('ws_cache_')) continue;

					const value = await localStorage.get(key);
					if (!isImageUrl(value) && !hasImageFields(value)) {
						data.push({
							key,
							value,
							timestamp: Date.now(),
						});
					}
				} catch (error) {
					console.error(`Error loading localStorage key ${key}:`, error);
				}
			}

			setLocalStorageData(data);
		} catch (error) {
			console.error('Error loading localStorage data:', error);
			setLocalStorageData([]);
		}
	};

	const loadStorageCacheData = async () => {
		try {
			const keys = await localStorage.getAllKeys();
			const data = [];

			for (const key of keys) {
				try {
					if (!key.startsWith('ws_cache_')) continue;

					const value = await localStorage.get(key);
					data.push({
						key,
						value,
						timestamp: Date.now(),
					});
				} catch (error) {
					console.error(`Error loading storageCache key ${key}:`, error);
				}
			}

			setStorageCacheData(data);
		} catch (error) {
			console.error('Error loading storageCache data:', error);
			setStorageCacheData([]);
		}
	};

	const loadImageData = async () => {
		try {
			const keys = await localStorage.getAllKeys();
			const data = [];

			for (const key of keys) {
				try {
					const value = await localStorage.get(key);
					if (isImageUrl(value) || hasImageFields(value)) {
						data.push({
							key,
							value,
							timestamp: Date.now(),
						});
					}
				} catch (error) {
					console.error(`Error loading image key ${key}:`, error);
				}
			}

			setImageData(data);
		} catch (error) {
			console.error('Error loading image data:', error);
			setImageData([]);
		}
	};

	const getCachedData = () => {
		return Array.from(requestCache?.entries()).map(([key, entry]) => ({
			id: key,
			key,
			data: entry.data,
			timestamp: entry.timestamp,
		}));
	};

	const filterDataBySearch = (data: any[]) => {
		if (!searchQuery.trim()) return data;

		const query = searchQuery.toLowerCase();

		return data.filter(item => {
			try {
				const itemString = JSON.stringify(item).toLowerCase();
				return itemString.includes(query);
			} catch (e) {
				return false;
			}
		});
	};

	const findMatchesInString = (text: string, query: string): number[] => {
		if (!text || !query) return [];
		const lowerText = text.toLowerCase();
		const lowerQuery = query.toLowerCase();
		let startIndex = 0;
		let index = lowerText.indexOf(lowerQuery, startIndex);
		const indices: number[] = [];
		while (index !== -1) {
			indices.push(index);
			startIndex = index + lowerQuery.length;
			index = lowerText.indexOf(lowerQuery, startIndex);
		}
		return indices;
	};

	const findAllMatches = () => {
		if (!searchQuery.trim()) {
			setSearchMatches([]);
			return;
		}

		const matches: any[] = [];
		const query = searchQuery.toLowerCase();

		const addMatches = (
			source: string,
			item: any,
			itemIndex: number,
			text: string,
			location: string,
			baseId: string
		) => {
			const indices = findMatchesInString(text, query);
			indices.forEach((index, i) => {
				const start = Math.max(0, index - 20);
				const end = Math.min(text.length, index + query.length + 20);
				const preview = text.substring(start, end);

				matches.push({
					tab: source,
					tabName: source.charAt(0).toUpperCase() + source.slice(1),
					item: item,
					itemIndex: itemIndex,
					id: baseId,
					location: location,
					matchText: preview,
					fullText: text,
					matchIndexInText: i,
					absoluteIndex: index
				});
			});
		};

		historyData.forEach((item, index) => {
			if (item.methodUrl) {
				addMatches('history', item, index, item.methodUrl, 'method', item.id);
			}
			if (item.request?.data) {
				const text = formatDiffData(item.request.data);
				addMatches('history', item, index, text, 'request', item.id);
			}

			if (item.response?.data) {
				const text = formatDiffData(item.response.data);
				addMatches('history', item, index, text, 'response', item.id);
			}

			if (item.request?.url) {
				addMatches('history', item, index, item.request.url, 'url', item.id);
			}
		});

		cachedData.forEach((item, index) => {
			if (item.key) {
				addMatches('cache', item, index, item.key, 'key', item.id);
			}
			if (item.data) {
				const text = formatDiffData(item.data);
				addMatches('cache', item, index, text, 'data', item.id);
			}
		});

		localStorageData.forEach((item, index) => {
			if (item.key) {
				addMatches('localStorage', item, index, item.key, 'key', item.id);
			}
			if (item.value) {
				const text = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
				addMatches('localStorage', item, index, text, 'value', item.id);
			}
		});


		setSearchMatches(matches);
		setSelectedMatchIndex(0);
	};

	const highlightText = (text: string, style?: any, activeMatchIndexInText: number = -1) => {
		if (!searchQuery.trim()) {
			return <Text style={style}>{text}</Text>;
		}

		const query = searchQuery.toLowerCase();
		const lowerText = text.toLowerCase();
		const parts: any[] = [];
		let lastIndex = 0;
		let matchCount = 0;

		let index = lowerText.indexOf(query);
		while (index !== -1) {
			if (index > lastIndex) {
				parts.push(
					<Text key={`text-${lastIndex}`} style={style}>
						{text.substring(lastIndex, index)}
					</Text>
				);
			}

			const isFocused = matchCount === activeMatchIndexInText;
			parts.push(
				<Text
					key={`match-${index}`}
					style={[
						style,
						{
							backgroundColor: isFocused ? '#ff9800' : '#ffeb3b',
							color: '#000',
							fontWeight: 'bold'
						}
					]}
				>
					{text.substring(index, index + query.length)}
				</Text>
			);

			matchCount++;
			lastIndex = index + query.length;
			index = lowerText.indexOf(query, lastIndex);
		}

		if (lastIndex < text.length) {
			parts.push(
				<Text key={`text-${lastIndex}`} style={style}>
					{text.substring(lastIndex)}
				</Text>
			);
		}

		return <Text>{parts}</Text>;
	};

	const SearchableDataView = ({
		text,
		isCached,
		isFromLocalStorage,
		activeMatch,
		fontSize
	}: {
		text: string,
		isCached?: boolean,
		isFromLocalStorage?: boolean,
		activeMatch?: any,
		fontSize: number;
	}) => {
		const scrollRef = useRef<ScrollView>(null);
		const textColorStyle = isFromLocalStorage ? styles.localCachedDataText : (isCached ? styles.cachedDataText : null);

		useEffect(() => {
			if (activeMatch && scrollRef.current) {
				const matchIndex = activeMatch.absoluteIndex;
				const textBefore = text.substring(0, matchIndex);
				const lineNumber = textBefore.split('\n').length;
				const lineHeight = fontSize * 1.5;

				scrollRef.current.scrollTo({
					y: Math.max(0, (lineNumber - 1) * lineHeight),
					animated: true
				});
			}
		}, [activeMatch, fontSize]);

		return (
			<ScrollView
				ref={scrollRef}
				style={styles.dataContainer}
				nestedScrollEnabled
			>
				<Box>
					{highlightText(
						text,
						[styles.dataText, textColorStyle, { fontSize }],
						activeMatch ? activeMatch.matchIndexInText : -1
					)}
				</Box>
			</ScrollView>
		);
	};

	const historyData = filterDataBySearch(globalHttpManager.debugHistory.pairs.map((pair, index) => ({
		...pair,
		id: pair.id || `pair-${index}`,
	})));

	const cachedData = filterDataBySearch(getCachedData());

	const memoizedLocalStorageData = filterDataBySearch(localStorageData.map((item, index) => ({
		...item,
		id: `localStorage-${item.key}-${index}`,
	})));

	const memoizedImageData = filterDataBySearch(imageData.map((item, index) => ({
		...item,
		id: `image-${item.key}-${index}`,
	})));

	const memoizedLoggerData = filterDataBySearch(storeLogger.logs.map((item, index) => ({
		...item,
		id: `logger-${item.id}-${index}`,
	})));

	const memoizedStorageCacheData = filterDataBySearch(storageCacheData.map((item, index) => ({
		...item,
		id: `storageCache-${item.key}-${index}`,
	})));

	const memoizedCacheUpdatesData = filterDataBySearch(globalHttpManager.cacheUpdateHistory.updates.map((item, index) => ({
		...item,
		id: item.id || `cacheUpdate-${index}`,
	})));

	useEffect(() => {
		findAllMatches();
	}, [
		searchQuery,
		historyData.length,
		cachedData.length,
		localStorageData.length
	]);

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString();
	};

	const isImageUrl = (url: any): boolean => {
		if (typeof url !== 'string') return false;
		return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url) || url.startsWith('data:image/');
	};

	const hasImageFields = (data: any): boolean => {
		if (typeof data !== 'object' || data === null) return false;
		return Object.values(data).some(value => isImageUrl(value));
	};

	const renderImage = (url: string) => (
		<View style={styles.imageContainer}>
			<Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
			<Text style={styles.imageUrl} numberOfLines={1}>{url}</Text>
		</View>
	);

	const renderDataContent = (data: any, isCached: boolean = false, isFromLocalStorage: boolean = false, location: string = 'data', itemId: string = '') => {
		const dataString = formatDiffData(data);
		const currentFz = getFz();

		const currentMatch = searchMatches[selectedMatchIndex];
		const isActive = currentMatch && currentMatch.id === itemId && currentMatch.location === location;

		if (isImageUrl(data)) {
			return renderImage(data);
		}

		if (typeof data === 'object' && data !== null) {
			const imageFields = Object.entries(data).filter(([key, value]) => isImageUrl(value));
			if (imageFields.length > 0) {
				return (
					<View>
						{imageFields.map(([key, url]) => (
							<View key={key} style={styles.imageFieldContainer}>
								{highlightText(key + ':', [styles.imageFieldKey, isFromLocalStorage ? styles.localCachedDataText : (isCached ? styles.cachedDataText : null)])}
								{renderImage(url as string)}
							</View>
						))}
						<SearchableDataView
							text={dataString}
							isCached={isCached}
							isFromLocalStorage={isFromLocalStorage}
							activeMatch={isActive ? currentMatch : undefined}
							fontSize={currentFz}
						/>
					</View>
				);
			}
		}

		return (
			<SearchableDataView
				text={dataString}
				isCached={isCached}
				isFromLocalStorage={isFromLocalStorage}
				activeMatch={isActive ? currentMatch : undefined}
				fontSize={currentFz}
			/>
		);
	};

	const renderRequestResponsePair = ({ item: pair }: { item: RequestResponsePair & { id: string; }; }) => {
		const isFromCache = pair.cached;
		const isFromLocalStorage = pair.localCached;

		let containerStyle = styles.pairContainer;
		if (isFromLocalStorage) {
			containerStyle = styles.localCachedPairContainer;
		} else if (isFromCache) {
			containerStyle = styles.cachedPairContainer;
		}

		return (
			<View style={containerStyle}>
				{/* Header with method url and cache indicator */}
				<View style={styles.pairHeader}>
					<View style={styles.serviceHeaderRow}>
						<Text style={styles.serviceMethodText}>{pair.methodUrl}</Text>
						<Box
							gap={5}
							fD='row'
							align='center'
						>
							{pair.repeatCount > 1 && (
								<View
									style={[
										styles.repeatIndicator,
										isFromLocalStorage && styles.localCachedRepeatIndicator,
									]}
								>
									<Text style={styles.repeatText}>×{pair.repeatCount}</Text>
								</View>
							)}
							<TouchableOpacity
								style={styles.copyButton}
								onPress={() => copyFetchPair(pair)}
							>
								<CopyMsgIcon size={16} color="#fff" />
							</TouchableOpacity>
						</Box>
					</View>

					{/* Tags Row */}
					<View style={styles.tagsRow}>
						{/* Show LOCAL-CACHED tag only if from localStorage */}
						{isFromLocalStorage && (
							<View style={styles.localCachedIndicator}>
								<Text style={styles.localCachedText}>📦 LOCAL-CACHED</Text>
							</View>
						)}
						{/* Show CACHED tag only if from localCache (not localStorage) */}
						{isFromCache && !isFromLocalStorage && (
							<View style={styles.cacheIndicator}>
								<Text style={styles.cacheIndicatorText}>📦 CACHED</Text>
							</View>
						)}
						{pair.noPending && (
							<View style={styles.noPendingIndicator}>
								<Text style={styles.noPendingText}>NO-PENDING</Text>
							</View>
						)}
						{pair.forceFetch && (
							<View style={styles.forceFetchIndicator}>
								<Text style={styles.forceFetchText}>FORCE-FETCH</Text>
							</View>
						)}
					</View>

					{pair.request.cacheKey && (
						<Text style={[
							styles.cacheKeyText,
							isFromLocalStorage && styles.localCachedDataText,
							isFromCache && !isFromLocalStorage && styles.cachedDataText
						]}>Key: {pair.request.cacheKey}</Text>
					)}
					{pair.request.url && (
						<Text style={[
							styles.takePathText,
							isFromLocalStorage && styles.localCachedDataText,
							isFromCache && !isFromLocalStorage && styles.cachedDataText
						]}>URL: {pair.request.url}</Text>
					)}
					{pair.takePath && (
						<Text style={[
							styles.takePathText,
							isFromLocalStorage && styles.localCachedDataText,
							isFromCache && !isFromLocalStorage && styles.cachedDataText
						]}>takePath: {pair.takePath}</Text>
					)}
				</View>

				{/* Request */}
				<View style={[
					styles.requestContainer,
					isFromLocalStorage && styles.localCachedRequest,
					isFromCache && !isFromLocalStorage && styles.cachedRequest
				]}>
					<View style={styles.requestHeader}>
						<Box
							fD='row'
							gap={5}
							align='center'
							style={{ marginRight: 5 }}
						>
							<View style={styles.requestIndicator}>
								<Text style={styles.requestText}>REQUEST</Text>
							</View>
						</Box>
						<Text style={styles.timestamp}>{formatTimestamp(pair.request.timestamp)}</Text>
						{pair.repeatCount > 1 && (
							<Text style={styles.timestamp}>Last: {formatTimestamp(pair.lastRepeatTimestamp)}</Text>
						)}
					</View>
					{renderDataContent(pair.request.data, isFromCache, isFromLocalStorage, 'request', pair.id)}
				</View>

				{/* Divider */}
				<View style={styles.divider}>
					<View style={styles.dividerLine} />
					<Text style={styles.dividerText}>↓</Text>
					<View style={styles.dividerLine} />
				</View>

				{/* Response */}
				{pair.response ? (
					<View style={[
						styles.responseContainer,
						isFromLocalStorage && styles.localCachedResponse,
						isFromCache && !isFromLocalStorage && styles.cachedResponse
					]}>
						<View style={styles.responseHeader}>
							<Box
								fD='row'
								gap={5}
								align='center'
								style={{ marginRight: 5 }}
							>
								<View style={[
									styles.responseIndicator,
									{ backgroundColor: pair.response.error ? '#ff4444' : '#2196F3' }
								]}>
									<Text style={styles.responseText}>
										{pair.response.error ? 'ERROR' : 'RESPONSE'}
									</Text>
								</View>
							</Box>
							<Text style={styles.timestamp}>{formatTimestamp(pair.response.timestamp)}</Text>
						</View>
						{renderDataContent(pair.response.data || pair.response.error, isFromCache, isFromLocalStorage, 'response', pair.id)}
					</View>
				) : (
					<View style={styles.pendingContainer}>
						<ActivityIndicator size="small" color="#2196F3" />
						<Text style={styles.pendingText}>Waiting for response...</Text>
					</View>
				)}
			</View>
		);
	};

	const renderCacheItem = ({ item }: { item: any; }) => (
		<View style={styles.cacheItem}>
			<View style={styles.cacheHeader}>
				<Text style={styles.cacheKey}>{item.key}</Text>
				<View style={styles.itemActions}>
					<Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
					<TouchableOpacity
						style={styles.copyButton}
						onPress={() => copyCacheItem(item)}
					>
						<CopyMsgIcon size={16} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.deleteButton}
						onPress={() => deleteCacheItem(item.key)}
					>
						<Text style={styles.deleteButtonText}>🗑️</Text>
					</TouchableOpacity>
				</View>
			</View>
			{renderDataContent(item.data, true, false, 'data', item.id)}
		</View>
	);

	const renderLocalStorageItem = ({ item }: { item: any; }) => {
		const arrayKeys = findArrayKeysDeep(item.value);

		return (
			<View style={styles.localStorageItem}>
				<Box fD='column'>
					<Box style={styles.localStorageHeader}>
						<Text style={styles.localStorageKey}>{item.key}</Text>
						<View style={styles.itemActions}>
							<Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
							<TouchableOpacity
								style={styles.copyButton}
								onPress={() => copyLocalStorageItem(item)}
							>
								<CopyMsgIcon size={16} color="#fff" />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => deleteLocalStorageItem(item.key)}
							>
								<Text style={styles.deleteButtonText}>🗑️</Text>
							</TouchableOpacity>
						</View>
					</Box>

					<Box mB={10}>
						{Object.entries(arrayKeys).map(([key, value]: any, index) => {
							if (value.length === 0) return <></>;
							return (
								<>
									<Text style={[styles.dataText, { color: '#9C27B0', fontWeight: 'bold' }, { fontSize: 12 }]} key={key}>
										Key: "{key}" - Length: {value.length}
									</Text>
								</>
							);
						})}
					</Box>
				</Box>
				{renderDataContent(item.value, false, true, 'value', item.id)}
			</View>
		);
	};

	const renderImageItem = ({ item }: { item: any; }) => (
		<View style={styles.imageItem}>
			<View style={styles.imageItemHeader}>
				<Text style={styles.imageItemKey}>{item.key}</Text>
				<View style={styles.itemActions}>
					<Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
					<TouchableOpacity
						style={styles.copyButton}
						onPress={() => copyImageItem(item)}
					>
						<CopyMsgIcon size={16} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.deleteButton}
						onPress={() => deleteImageItem(item.key)}
					>
						<Text style={styles.deleteButtonText}>🗑️</Text>
					</TouchableOpacity>
				</View>
			</View>
			{renderDataContent(item.value, false, false, 'value', item.id)}
		</View>
	);

	const renderLoggerItem = ({ item }: { item: any; }) => (
		<TouchableOpacity
			style={styles.loggerItem}
			onPress={() => copySingleLog(item)}
			activeOpacity={0.7}
		>
			<Text style={{ ...styles.loggerItemText, fontSize: logFz }}>
				<Text style={{ color: 'gray', fontSize: logFz }}>
					{formatTimestamp(item.timestamp)}: {""}
				</Text>
				<Text style={{ color: getLogColor(item.type) }}>[{item.name}]:</Text> {item.message}
			</Text>
		</TouchableOpacity>
	);


	const renderCacheUpdateItem = ({ item }: { item: any; }) => {
		const getUpdateTypeColor = (type: string) => {
			switch (type) {
				case 'saiUpdater': return '#4CAF50';
				case 'saiLocalCacheUpdater': return '#2196F3';
				case 'saiLocalStorageUpdater': return '#9C27B0';
				case 'saiCacheUpdater': return '#FF9800';
				default: return '#888';
			}
		};

		const formatChanges = (changes: any) => {
			const parts = [];
			if (changes.arrayAdded) parts.push(`+${changes.arrayAdded} added`);
			if (changes.arrayRemoved) parts.push(`-${changes.arrayRemoved} removed`);
			if (changes.totalCount !== undefined) parts.push(`Total: ${changes.totalCount}`);
			if (changes.keysChanged?.length) parts.push(`Keys: ${changes.keysChanged.join(', ')}`);
			if (changes.details) parts.push(changes.details);
			return parts.join(' | ');
		};

		return (
			<TouchableOpacity
				style={styles.cacheUpdateItem}
				onPress={() => copyCacheUpdateItem(item)}
				activeOpacity={0.7}
			>
				<Text style={{ ...styles.cacheUpdateText, fontSize: cacheUpdatesFz }}>
					<Text style={{ color: 'gray', fontSize: cacheUpdatesFz }}>
						{formatTimestamp(item.timestamp)}:{" "}
					</Text>
					<Text style={{ color: getUpdateTypeColor(item.updateType), fontWeight: 'bold' }}>
						[{item.updateType}]
					</Text>
					<Text style={{ color: '#FFC107' }}> {item.cacheId}</Text>
					{' - '}
					<Text style={{ color: item.success ? '#4CAF50' : '#ff4444' }}>
						{item.success ? '✓' : '✗'}
					</Text>
					{' '}
					{formatChanges(item.changes)}
					{item.error && <Text style={{ color: '#ff4444' }}> Error: {item.error}</Text>}
				</Text>
			</TouchableOpacity>
		);
	};

	const clearHistory = () => {
		globalHttpManager.debugHistory.clear();
	};

	const clearCache = () => {
		globalHttpManager.requestCache.clear();
	};

	const clearLocalStorage = async () => {
		try {
			const keys = await localStorage.getAllKeys();
			for (const key of keys) {
				if (key.startsWith('ws_cache_')) continue;

				const value = await localStorage.get(key);
				if (!isImageUrl(value) && !hasImageFields(value)) {
					await localStorage.remove(key);
				}
			}
			setLocalStorageData([]);
		} catch (error) {
			console.error('Error clearing localStorage:', error);
		}
	};

	const clearImages = async () => {
		try {
			const keys = await localStorage.getAllKeys();
			for (const key of keys) {
				const value = await localStorage.get(key);
				if (isImageUrl(value) || hasImageFields(value)) {
					await localStorage.remove(key);
				}
			}
			setImageData([]);
		} catch (error) {
			console.error('Error clearing images:', error);
		}
	};

	const deleteCacheItem = (key: string) => {
		globalWebSocketManager.requestCache.delete(key);
	};

	const deleteLocalStorageItem = async (key: string) => {
		try {
			await localStorage.remove(key);
			setLocalStorageData(prev => prev.filter(item => item.key !== key));
		} catch (error) {
			console.error('Error deleting localStorage item:', error);
		}
	};

	const deleteImageItem = async (key: string) => {
		try {
			await localStorage.remove(key);
			setImageData(prev => prev.filter(item => item.key !== key));
		} catch (error) {
			console.error('Error deleting image item:', error);
		}
	};

	const copyToClipboard = async (text: string, successMessage: string = 'Copied!') => {
		await Clipboard.setStringAsync(text);
		logger.success('Debugger', successMessage);
	};

	const copyLast100Logs = () => {
		const logs = storeLogger.logs.slice(-100);
		const text = logs.map(log => {
			const time = formatTimestamp(log.timestamp);
			return `${time} [${log.name}]: ${log.message}`;
		}).join('\n');
		copyToClipboard(text, 'Last 100 logs copied!');
	};

	const copySingleLog = (log: any) => {
		const time = formatTimestamp(log.timestamp);
		const text = `${time} [${log.name}]: ${log.message}`;
		copyToClipboard(text, 'Log copied!');
	};

	const copyFetchPair = (pair: RequestResponsePair) => {
		const requestData = formatDiffData(pair.request.data);
		const responseData = pair.response
			? formatDiffData(pair.response.error || pair.response.data)
			: 'Waiting for response...';

		const text = `Method: ${pair.methodUrl}\n\nRequest:\n${requestData}\n\nResponse:\n${responseData}`;
		copyToClipboard(text, 'Fetch copied!');
	};

	const copyCacheItem = (item: any) => {
		const text = `Key: ${item.key}\nTimestamp: ${formatTimestamp(item.timestamp)}\n\nData:\n${formatDiffData(item.data)}`;
		copyToClipboard(text, 'Cache item copied!');
	};

	const copyLocalStorageItem = (item: any) => {
		const text = `Key: ${item.key}\nTimestamp: ${formatTimestamp(item.timestamp)}\n\nValue:\n${formatDiffData(item.value)}`;
		copyToClipboard(text, 'LocalStorage item copied!');
	};

	const copyImageItem = (item: any) => {
		const text = `Key: ${item.key}\nTimestamp: ${formatTimestamp(item.timestamp)}\n\nValue:\n${formatDiffData(item.value)}`;
		copyToClipboard(text, 'Image item copied!');
	};


	const copyCacheUpdateItem = (item: any) => {
		const text = `Type: ${item.updateType}\nCache ID: ${item.cacheId}\nTimestamp: ${formatTimestamp(item.timestamp)}\nSuccess: ${item.success}\nChanges: ${JSON.stringify(item.changes, null, 2)}${item.error ? `\nError: ${item.error}` : ''}`;
		copyToClipboard(text, 'Cache Update copied!');
	};

	const getItemType = (item: any, index: number) => {
		if (activeTab === 'history') {
			return item.cached ? 'cached-pair' : 'pair';
		}
		return activeTab;
	};

	const getEstimatedItemSize = () => {
		switch (activeTab) {
			case 'history':
				return 300;
			case 'cache':
				return 150;
			case 'localStorage':
				return 120;
			case 'images':
				return 200;
			case 'events':
				return 150;
			default:
				return 100;
		}
	};

	const renderEmptyComponent = () => {
		const emptyTexts = {
			history: 'Request history is empty',
			cache: 'Cache is empty',
			localStorage: 'LocalStorage is empty',
			storageCache: 'StorageCache is empty',
			images: 'No images',
			logger: 'Logger is empty',
			cacheUpdates: 'Cache Updates is empty'
		};

		return (
			<View style={styles.emptyState}>
				<Text style={styles.emptyText}>
					{emptyTexts[activeTab as keyof typeof emptyTexts]}
				</Text>
			</View>
		);
	};

	const [route, setRoute] = useState<RouteProp<any> | null>(null);

	useEffect(() => {
		const lastRoute = routeInteractions.getLastRoute();
		setRoute(lastRoute as RouteProp<any>);
	}, [isMenuVisible]);

	const scrollViewRef = useRef<FlashList<any>>(null);
	const [isAtBottom, setIsAtBottom] = useState(true);

	const scrollToMatch = (index: number) => {
		const match = searchMatches[index];
		if (!match) return;

		if (match.tab !== activeTab) {
			setActiveTab(match.tab);
			setTimeout(() => {
				scrollViewRef.current?.scrollToIndex({ index: match.itemIndex, animated: true });
			}, 100);
		} else {
			scrollViewRef.current?.scrollToIndex({ index: match.itemIndex, animated: true });
		}
	};

	const teleportToBottom = () => {
		if (!scrollViewRef.current) return;
		if (!isAtBottom) return;
		if (activeTab === 'logger') {
			scrollViewRef.current?.scrollToIndex({ index: memoizedLoggerData.length - 1, animated: true });
		}
	};

	useEffect(() => {
		teleportToBottom();
	}, [memoizedLoggerData]);

	const handleScroll = (e: any) => {
		const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
		const paddingToBottom = 50;
		const isBottomNow =
			contentOffset.y + layoutMeasurement.height >=
			contentSize.height - paddingToBottom;

		setIsAtBottom(isBottomNow);
	};

	const increaseStorageFz = async () => {
		const newLocalStorageFz = localStorageFz >= 30 ? 30 : localStorageFz + 1;
		await localStorage.set('localStorageFz', newLocalStorageFz);
		setLocalStorageFz(newLocalStorageFz);
	};

	const decreaseStorageFz = async () => {
		const newLocalStorageFz = Math.max(1, localStorageFz - 1);
		await localStorage.set('localStorageFz', newLocalStorageFz);
		setLocalStorageFz(newLocalStorageFz);
	};

	const increaseLogFz = async () => {
		const newLogFz = logFz >= 30 ? 30 : logFz + 1;
		await localStorage.set('logFz', newLogFz);
		setLogFz(newLogFz);
	};

	const decreaseLogFz = async () => {
		const newLogFz = Math.max(1, logFz - 1);
		await localStorage.set('logFz', newLogFz);
		setLogFz(newLogFz);
	};

	const increaseFetchesFz = async () => {
		const newFetchesFz = fetchesFz >= 30 ? 30 : fetchesFz + 1;
		await localStorage.set('fetchesFz', newFetchesFz);
		setFetchesFz(newFetchesFz);
	};

	const decreaseFetchesFz = async () => {
		const newFetchesFz = Math.max(1, fetchesFz - 1);
		await localStorage.set('fetchesFz', newFetchesFz);
		setFetchesFz(newFetchesFz);
	};

	const increaseCacheFz = async () => {
		const newCacheFz = cacheFz >= 30 ? 30 : cacheFz + 1;
		await localStorage.set('cacheFz', newCacheFz);
		setCacheFz(newCacheFz);
	};

	const decreaseCacheFz = async () => {
		const newCacheFz = Math.max(1, cacheFz - 1);
		await localStorage.set('cacheFz', newCacheFz);
		setCacheFz(newCacheFz);
	};


	const getFz = () => {
		const fz = {
			"history": fetchesFz,
			"logger": logFz,
			"cache": cacheFz,
			"localStorage": localStorageFz
		};
		return fz[activeTab as keyof typeof fz] || 10;
	};

	const initFz = async () => {
		const loggerFz = await localStorage.get('logFz');
		const fetchesFz = await localStorage.get('fetchesFz');
		const cacheFz = await localStorage.get('cacheFz');
		const localStorageFz = await localStorage.get('localStorageFz');
		const storageCacheFz = await localStorage.get('storageCacheFz');
		const cacheUpdatesFz = await localStorage.get('cacheUpdatesFz');

		loggerFz && setLogFz(Number(loggerFz) || 10);
		fetchesFz && setFetchesFz(Number(fetchesFz) || 10);
		cacheFz && setCacheFz(Number(cacheFz) || 10);
		localStorageFz && setLocalStorageFz(Number(localStorageFz) || 10);
		storageCacheFz && setStorageCacheFz(Number(storageCacheFz) || 10);
		cacheUpdatesFz && setCacheUpdatesFz(Number(cacheUpdatesFz) || 10);
	};

	useEffect(() => { initFz(); }, []);

	return (
		<>
			<PanGestureHandler onGestureEvent={gestureHandler}>
				<Animated.View style={[styles.circle, animatedStyle]}>
					<TouchableOpacity
						style={styles.circleButton}
						onPress={openMenu}
						activeOpacity={0.8}
					>
						<Text style={styles.circleText}>
							<ReactIcon size={25} />
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</PanGestureHandler>

			<Modal
				visible={isMenuVisible}
				transparent
				animationType="fade"
				onRequestClose={closeMenu}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.menuContainer}>
						<View style={styles.menuHeader}>
							<Box
								fD="row"
								justify="space-between"
								align="center"
							>
								<Box fD="row" gap={10} align='center'>
									<Text style={styles.menuTitle}>Debugger</Text>
									<ReactIcon size={25} />
								</Box>
								<Box fD="row" gap={10} align='center'>
									<TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
										<Text style={styles.closeText}>✕</Text>
									</TouchableOpacity>
								</Box>
							</Box>

							<Box
								fD="column"
								bgColor="#2d2d2d"
							>
								<SimpleButtonUi
									onPress={async () => {
										await Clipboard.setStringAsync(route?.name || "No route");
									}}
								>
									<Text style={{ fontSize: 12, color: "white" }}>
										{route?.name || "No route"}
									</Text>
								</SimpleButtonUi>
								<SimpleButtonUi
									onPress={async () => {
										await Clipboard.setStringAsync(JSON.stringify(route?.params) || "No params");
									}}
								>
									<Text style={{ fontSize: 12, color: "white" }}>
										{formatDiffData(route?.params) || "No params"}
									</Text>
								</SimpleButtonUi>
							</Box>
						</View>

						{/* Global Search */}
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: 8,
								paddingHorizontal: 10,
								paddingVertical: 8,
								backgroundColor: '#1a1a1a',
								borderBottomWidth: 1,
								borderBottomColor: '#333'
							}}
						>
							<TextInput
								style={styles.searchInput}
								placeholder="Search all data..."
								placeholderTextColor="#666"
								value={searchQuery}
								onChangeText={setSearchQuery}
								autoCapitalize="none"
								autoCorrect={false}
							/>
							{searchQuery.length > 0 && (
								<>
									{/* Navigation buttons */}
									{searchMatches.length > 1 && (
										<>
											<TouchableOpacity
												onPress={() => {
													const newIndex = selectedMatchIndex > 0 ? selectedMatchIndex - 1 : searchMatches.length - 1;
													setSelectedMatchIndex(newIndex);
													scrollToMatch(newIndex);
												}}
												style={styles.navButton}
											>
												<Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>↑</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => {
													const newIndex = selectedMatchIndex < searchMatches.length - 1 ? selectedMatchIndex + 1 : 0;
													setSelectedMatchIndex(newIndex);
													scrollToMatch(newIndex);
												}}
												style={styles.navButton}
											>
												<Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>↓</Text>
											</TouchableOpacity>
										</>
									)}

									{/* Match count and list toggle */}
									<TouchableOpacity
										onPress={() => setShowSearchMatches(!showSearchMatches)}
										style={{
											paddingHorizontal: 8,
											paddingVertical: 4,
											backgroundColor: showSearchMatches ? '#4CAF50' : '#2196F3',
											borderRadius: 12,
											flexDirection: 'row',
											alignItems: 'center',
											gap: 4
										}}
									>
										<Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
											{searchMatches.length} {searchMatches.length === 1 ? 'match' : 'matches'}
										</Text>
										<Text style={{ color: '#fff', fontSize: 10 }}>
											{showSearchMatches ? '▼' : '▶'}
										</Text>
									</TouchableOpacity>
								</>
							)}
						</View>

						{/* Match List Panel */}
						{showSearchMatches && searchMatches.length > 0 && (
							<ScrollView
								style={{
									maxHeight: 200,
									backgroundColor: '#1a1a1a',
									borderBottomWidth: 1,
									borderBottomColor: '#333'
								}}
								nestedScrollEnabled
							>
								{searchMatches.map((match, index) => (
									<TouchableOpacity
										key={`match-${index}`}
										onPress={() => {
											setSelectedMatchIndex(index);
											scrollToMatch(index);
										}}
										style={{
											padding: 8,
											borderBottomWidth: 1,
											borderBottomColor: '#2d2d2d',
											backgroundColor: index === selectedMatchIndex ? '#2d2d2d' : 'transparent'
										}}
									>
										<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
											<Text style={{ color: '#2196F3', fontSize: 11, fontWeight: 'bold' }}>
												{match.tabName}
											</Text>
											<Text style={{ color: '#888', fontSize: 10 }}>›</Text>
											<Text style={{ color: '#FFC107', fontSize: 10 }}>
												{match.location}
											</Text>
											{match.item?.methodUrl && (
												<>
													<Text style={{ color: '#888', fontSize: 10 }}>›</Text>
													<Text style={{ color: '#4CAF50', fontSize: 10 }}>
														{match.item.methodUrl}
													</Text>
												</>
											)}
										</View>
										<Text
											style={{ color: '#ccc', fontSize: 10 }}
											numberOfLines={1}
										>
											...{match.matchText}...
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						)}

						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.tabBar}
							contentContainerStyle={styles.tabBarContent}
						>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'history' && styles.activeTab]}
								onPress={() => setActiveTab('history')}
							>
								<Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
									Requests ({globalHttpManager.debugHistory.pairs.length})
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'cache' && styles.activeTab]}
								onPress={() => setActiveTab('cache')}
							>
								<Text style={[styles.tabText, activeTab === 'cache' && styles.activeTabText]}>
									Cache ({globalHttpManager.requestCache.size})
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'logger' && styles.activeTab]}
								onPress={() => setActiveTab('logger')}
							>
								<Text style={[styles.tabText, activeTab === 'logger' && styles.activeTabText]}>
									Logger ({memoizedLoggerData.length})
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'localStorage' && styles.activeTab]}
								onPress={() => {
									setActiveTab('localStorage');
									loadLocalStorageData();
								}}
							>
								<Text style={[styles.tabText, activeTab === 'localStorage' && styles.activeTabText]}>
									LocalStorage ({localStorageData.length})
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'storageCache' && styles.activeTab]}
								onPress={() => {
									setActiveTab('storageCache');
									loadStorageCacheData();
								}}
							>
								<Text style={[styles.tabText, activeTab === 'storageCache' && styles.activeTabText]}>
									StorageCache ({storageCacheData.length})
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'images' && styles.activeTab]}
								onPress={() => {
									setActiveTab('images');
									loadImageData();
								}}
							>
								<Text style={[styles.tabText, activeTab === 'images' && styles.activeTabText]}>
									Images ({imageData.length})
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === 'cacheUpdates' && styles.activeTab]}
								onPress={() => setActiveTab('cacheUpdates')}
							>
								<Text style={[styles.tabText, activeTab === 'cacheUpdates' && styles.activeTabText]}>
									Cache Updates ({globalHttpManager.cacheUpdateHistory.updates.length})
								</Text>
							</TouchableOpacity>
						</ScrollView>

						<View style={styles.actionBar}>
							{activeTab === 'history' && (
								<Box fD="row" gap={10} align='center'>
									<TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
										<Text style={styles.clearButtonText}>Clear history</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.increaseButton} onPress={increaseFetchesFz}>
										<Text style={styles.clearButtonText}>+1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.decreaseButton} onPress={decreaseFetchesFz}>
										<Text style={styles.clearButtonText}>-1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.defBtn} onPress={() => setFetchesFz(10)}>
										<Text style={styles.clearButtonText}>DEF</Text>
									</TouchableOpacity>
								</Box>
							)}
							{activeTab === 'cache' && (
								<Box fD="row" gap={10} align='center'>
									<TouchableOpacity style={styles.clearButton} onPress={clearCache}>
										<Text style={styles.clearButtonText}>Clear cache</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.increaseButton} onPress={increaseCacheFz}>
										<Text style={styles.clearButtonText}>+1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.decreaseButton} onPress={decreaseCacheFz}>
										<Text style={styles.clearButtonText}>-1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.defBtn} onPress={() => setCacheFz(10)}>
										<Text style={styles.clearButtonText}>DEF</Text>
									</TouchableOpacity>
								</Box>
							)}
							{activeTab === 'logger' && (
								<Box fD="row" gap={10} align='center'>
									<TouchableOpacity style={styles.copyAllButton} onPress={copyLast100Logs}>
										<Box fD="row" gap={5} align="center">
											<CopyMsgIcon size={14} color="#fff" />
											<Text style={styles.clearButtonText}>100</Text>
										</Box>
									</TouchableOpacity>
									<TouchableOpacity style={styles.clearButton} onPress={storeLogger.clearLogs}>
										<Text style={styles.clearButtonText}>Clear</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.increaseButton} onPress={increaseLogFz}>
										<Text style={styles.clearButtonText}>+FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.decreaseButton} onPress={decreaseLogFz}>
										<Text style={styles.clearButtonText}>-FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.defBtn} onPress={() => setLogFz(10)}>
										<Text style={styles.clearButtonText}>DEF</Text>
									</TouchableOpacity>
								</Box>
							)}
							{activeTab === 'images' && (
								<View style={styles.actionButtons}>
									<TouchableOpacity style={styles.clearButton} onPress={clearImages}>
										<Text style={styles.clearButtonText}>Clear images</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.refreshButton} onPress={loadImageData}>
										<Text style={styles.refreshButtonText}>🔄 Refresh</Text>
									</TouchableOpacity>
								</View>
							)}
							{activeTab === 'localStorage' && (
								<View style={styles.actionButtons}>
									<TouchableOpacity style={styles.clearButton} onPress={clearLocalStorage}>
										<Text style={styles.clearButtonText}>Clear</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.refreshButton} onPress={loadLocalStorageData}>
										<Text style={styles.refreshButtonText}>🔄 Refresh</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.increaseButton} onPress={increaseStorageFz}>
										<Text style={styles.clearButtonText}>+1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.decreaseButton} onPress={decreaseStorageFz}>
										<Text style={styles.clearButtonText}>-1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.defBtn} onPress={() => setLocalStorageFz(10)}>
										<Text style={styles.clearButtonText}>DEF</Text>
									</TouchableOpacity>
								</View>
							)}
							{activeTab === 'storageCache' && (
								<View style={styles.actionButtons}>
									<TouchableOpacity style={styles.clearButton} onPress={async () => {
										try {
											globalWebSocketManager.localStorageCache.clear();

											const keys = await localStorage.getAllKeys();
											for (const key of keys) {
												if (key.startsWith('ws_cache_')) {
													await localStorage.remove(key);
												}
											}

											setStorageCacheData([]);
										} catch (error) {
											console.error('Error clearing storage cache:', error);
										}
									}}>
										<Text style={styles.clearButtonText}>Clear</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.refreshButton} onPress={loadStorageCacheData}>
										<Text style={styles.refreshButtonText}>🔄 Refresh</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.increaseButton} onPress={async () => {
										const newFz = storageCacheFz >= 30 ? 30 : storageCacheFz + 1;
										await localStorage.set('storageCacheFz', newFz);
										setStorageCacheFz(newFz);
									}}>
										<Text style={styles.clearButtonText}>+1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.decreaseButton} onPress={async () => {
										const newFz = Math.max(1, storageCacheFz - 1);
										await localStorage.set('storageCacheFz', newFz);
										setStorageCacheFz(newFz);
									}}>
										<Text style={styles.clearButtonText}>-1 FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.defBtn} onPress={() => setStorageCacheFz(10)}>
										<Text style={styles.clearButtonText}>DEF</Text>
									</TouchableOpacity>
								</View>
							)}
							{activeTab === 'cacheUpdates' && (
								<Box fD="row" gap={10} align='center'>
									<TouchableOpacity style={styles.clearButton} onPress={() => globalHttpManager.cacheUpdateHistory.clear()}>
										<Text style={styles.clearButtonText}>Clear</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.increaseButton} onPress={async () => {
										const newFz = cacheUpdatesFz >= 30 ? 30 : cacheUpdatesFz + 1;
										await localStorage.set('cacheUpdatesFz', newFz);
										setCacheUpdatesFz(newFz);
									}}>
										<Text style={styles.clearButtonText}>+FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.decreaseButton} onPress={async () => {
										const newFz = Math.max(1, cacheUpdatesFz - 1);
										await localStorage.set('cacheUpdatesFz', newFz);
										setCacheUpdatesFz(newFz);
									}}>
										<Text style={styles.clearButtonText}>-FZ</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.defBtn} onPress={() => setCacheUpdatesFz(10)}>
										<Text style={styles.clearButtonText}>DEF</Text>
									</TouchableOpacity>
								</Box>
							)}
							B</View>

						<View style={styles.content}>
							{activeTab === 'history' ? (
								<FlashList
									ref={scrollViewRef as any}
									data={historyData}
									renderItem={renderRequestResponsePair}
									keyExtractor={(item) => item.id}
									estimatedItemSize={getEstimatedItemSize()}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.flashListContainer}
								/>
							) : activeTab === 'cache' ? (
								<FlashList
									ref={scrollViewRef as any}
									data={cachedData}
									renderItem={renderCacheItem}
									keyExtractor={(item) => item.id}
									estimatedItemSize={getEstimatedItemSize()}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.flashListContainer}
								/>
							) : activeTab === 'images' ? (
								<FlashList
									ref={scrollViewRef as any}
									data={memoizedImageData}
									renderItem={renderImageItem}
									keyExtractor={(item) => item.id}
									estimatedItemSize={getEstimatedItemSize()}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.flashListContainer}
								/>
							) : activeTab === 'logger' ? (
								<FlashList
									ref={scrollViewRef as any}
									data={memoizedLoggerData}
									renderItem={renderLoggerItem}
									keyExtractor={(item) => item.id}
									estimatedItemSize={getEstimatedItemSize()}
									onScroll={handleScroll}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.loggerContainer}
								/>
							) : activeTab === 'storageCache' ? (
								<FlashList
									ref={scrollViewRef as any}
									data={memoizedStorageCacheData}
									renderItem={renderLocalStorageItem}
									keyExtractor={(item) => item.id}
									estimatedItemSize={getEstimatedItemSize()}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.flashListContainer}
								/>
							) : activeTab === 'cacheUpdates' ? (
								<FlashList
									ref={scrollViewRef as any}
									data={memoizedCacheUpdatesData}
									renderItem={renderCacheUpdateItem}
									keyExtractor={(item) => item.id}
									estimatedItemSize={100}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.loggerContainer}
								/>
							) : (
								<FlashList
									ref={scrollViewRef as any}
									data={memoizedLocalStorageData}
									renderItem={renderLocalStorageItem}
									keyExtractor={(item) => item.id}
									estimatedItemSize={getEstimatedItemSize()}
									getItemType={getItemType}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={renderEmptyComponent}
									contentContainerStyle={styles.flashListContainer}
								/>
							)}
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
});

const styles = StyleSheet.create({
	defBtn: {
		backgroundColor: "#ff9800",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
		alignSelf: 'flex-start',
	},
	loggerContainer: {
		backgroundColor: '#2d2d2d',
		borderRadius: 5,
		paddingVertical: 10
	},
	loggerItem: {
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	loggerItemText: {
		color: '#fff',
	},
	circle: {
		position: 'absolute',
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		zIndex: 9999,
	},
	circleButton: {
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		borderRadius: CIRCLE_SIZE / 2,
		backgroundColor: 'black',
		borderWidth: 2,
		borderColor: '#333',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	circleText: {
		fontSize: 20,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	menuContainer: {
		width: MENU_WIDTH,
		height: MENU_HEIGHT,
		backgroundColor: '#1e1e1e',
		borderRadius: 15,
		overflow: 'hidden',
	},
	menuHeader: {
		padding: 15,
		backgroundColor: '#2d2d2d',
		gap: 10,
	},
	menuTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
	},
	reconnectButton: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 8,
		backgroundColor: '#2196F3',
		justifyContent: 'center',
		alignItems: 'center',
	},
	reconnectButtonText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
	},
	closeButton: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#ff4444',
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	tabBar: {
		backgroundColor: '#2d2d2d',
		borderBottomWidth: 1,
		borderBottomColor: '#3d3d3d',
		borderTopWidth: 1,
		borderTopColor: '#3d3d3d',
		maxHeight: 40,
		minHeight: 40,
	},
	tabBarContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	tab: {
		paddingHorizontal: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		height: "100%"
	},
	activeTab: {
		backgroundColor: '#4CAF50',
	},
	tabText: {
		color: '#aaa',
		fontSize: 10,
		fontWeight: '500',
	},
	activeTabText: {
		color: '#fff',
	},
	actionBar: {
		padding: 10,
		backgroundColor: '#2d2d2d',
		borderBottomWidth: 1,
		borderBottomColor: '#3d3d3d',
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 10,
	},
	clearButton: {
		backgroundColor: '#ff4444',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
		alignSelf: 'flex-start',
	},
	increaseButton: {
		backgroundColor: '#4CAF50',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
		alignSelf: 'flex-start',
	},
	decreaseButton: {
		backgroundColor: '#2196F3',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
		alignSelf: 'flex-start',
	},
	clearButtonText: {
		color: '#fff',
		fontSize: 11,
		fontWeight: '500',
	},
	refreshButton: {
		backgroundColor: '#2196F3',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
	},
	refreshButtonText: {
		color: '#fff',
		fontSize: 11,
		fontWeight: '500',
	},
	content: {
		flex: 1,
		padding: 10,
	},
	flashListContainer: {
		paddingBottom: 10,
	},

	// Request-Response Pair Styles
	pairContainer: {
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		marginBottom: 15,
		padding: 12,
		borderWidth: 1,
		borderColor: '#3d3d3d',
	},
	cachedPairContainer: {
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		marginBottom: 15,
		padding: 12,
		borderWidth: 2,
		borderColor: '#FFC107',
		shadowColor: '#FFC107',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
	localCachedPairContainer: {
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		marginBottom: 15,
		padding: 12,
		borderWidth: 2,
		borderColor: '#9C27B0',
		shadowColor: '#9C27B0',
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
	pairHeader: {
		marginBottom: 10,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#3d3d3d',
	},
	serviceHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	serviceMethodText: {
		color: '#4CAF50',
		fontSize: 14,
		fontWeight: 'bold',
		flex: 1,
	},
	repeatIndicator: {
		backgroundColor: '#ff9800',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
		marginLeft: 8,
	},
	localCachedRepeatIndicator: {
		backgroundColor: '#9C27B0',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
		marginLeft: 8,
	},
	repeatText: {
		color: '#fff',
		fontSize: 10,
		fontWeight: 'bold',
	},
	cacheIndicator: {
		backgroundColor: '#FFC107',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		height: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cacheIndicatorText: {
		color: '#000',
		fontSize: 10,
		fontWeight: 'bold',
	},
	cacheKeyText: {
		color: '#FFC107',
		fontSize: 10,
		fontStyle: 'italic',
	},
	takePathText: {
		color: '#2196F3',
		fontSize: 10,
		fontStyle: 'italic',
		marginTop: 2,
	},
	tagsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 4,
		marginBottom: 8,
		marginTop: 2,
	},
	localCachedIndicator: {
		backgroundColor: '#9C27B0',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		height: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	localCachedText: {
		color: '#fff',
		fontSize: 10,
		fontWeight: 'bold',
	},
	noPendingIndicator: {
		backgroundColor: '#2196F3',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		height: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noPendingText: {
		color: '#fff',
		fontSize: 10,
		fontWeight: 'bold',
	},
	forceFetchIndicator: {
		backgroundColor: 'red',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		height: 20,
	},
	forceFetchText: {
		color: '#fff',
		fontSize: 10,
		fontWeight: 'bold',
	},

	// Request Styles
	requestContainer: {
		backgroundColor: '#1a1a1a',
		borderRadius: 6,
		padding: 8,
		marginBottom: 8,
	},
	cachedRequest: {
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	localCachedRequest: {
		backgroundColor: 'rgba(156, 39, 176, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(156, 39, 176, 0.3)',
	},
	requestHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	requestIndicator: {
		backgroundColor: '#4CAF50',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 3,
	},
	requestText: {
		color: '#fff',
		fontSize: 9,
		fontWeight: 'bold',
	},

	// Response Styles
	responseContainer: {
		backgroundColor: '#1a1a1a',
		borderRadius: 6,
		padding: 8,
		marginTop: 8,
	},
	cachedResponse: {
		backgroundColor: 'rgba(255, 193, 7, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(255, 193, 7, 0.3)',
	},
	localCachedResponse: {
		backgroundColor: 'rgba(156, 39, 176, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(156, 39, 176, 0.3)',
	},
	responseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	responseIndicator: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 3,
	},
	responseText: {
		color: '#fff',
		fontSize: 9,
		fontWeight: 'bold',
	},

	// Divider Styles
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#4CAF50',
	},
	dividerText: {
		color: '#4CAF50',
		marginHorizontal: 8,
		fontSize: 12,
		fontWeight: 'bold',
	},

	// Pending Response
	pendingResponse: {
		backgroundColor: '#333',
		borderRadius: 6,
		padding: 12,
		marginTop: 8,
		alignItems: 'center',
	},
	pendingText: {
		color: '#888',
		fontSize: 12,
		fontStyle: 'italic',
	},

	// Common Styles
	timestamp: {
		color: '#888',
		fontSize: 10,
		marginRight: 8,
	},
	dataContainer: {
		maxHeight: 200,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 4,
		padding: 6,
	},
	dataText: {
		color: '#fff',
		fontFamily: 'monospace',
		lineHeight: 14,
	},
	cachedDataText: {
		color: '#FFC107',
	},
	localCachedDataText: {
		color: 'rgb(168, 74, 255)',
	},

	// Image Styles
	imageContainer: {
		marginBottom: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 4,
		padding: 8,
	},
	image: {
		width: '100%',
		height: 120,
		borderRadius: 4,
		marginBottom: 4,
	},
	imageUrl: {
		color: '#888',
		fontSize: 9,
		fontFamily: 'monospace',
	},
	imageFieldContainer: {
		marginBottom: 8,
	},
	imageFieldKey: {
		color: '#4CAF50',
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 4,
	},

	// Cache Tab Styles
	cacheItem: {
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		marginBottom: 10,
		padding: 10,
	},
	cacheHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	cacheKey: {
		color: '#4CAF50',
		fontSize: 12,
		fontWeight: 'bold',
		flex: 1,
	},
	cacheDataText: {
		color: '#FFC107',
		fontSize: 11,
		fontFamily: 'monospace',
		lineHeight: 16,
	},

	// LocalStorage Tab Styles
	localStorageItem: {
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		marginBottom: 10,
		padding: 10,
		borderLeftWidth: 3,
		borderLeftColor: '#9C27B0',
	},
	localStorageHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	localStorageKey: {
		color: '#9C27B0',
		fontSize: 12,
		fontWeight: 'bold',
		flex: 1,
	},

	// Images Tab Styles
	imageItem: {
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		marginBottom: 10,
		padding: 10,
		borderLeftWidth: 3,
		borderLeftColor: '#2196F3',
	},
	pendingContainer: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	imageItemHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	imageItemKey: {
		color: '#2196F3',
		fontSize: 12,
		fontWeight: 'bold',
		flex: 1,
	},
	itemActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	deleteButton: {
		padding: 4,
		borderRadius: 4,
		backgroundColor: '#ff4444',
	},
	deleteButtonText: {
		color: '#fff',
		fontSize: 12,
	},
	copyButton: {
		padding: 4,
		borderRadius: 4,
		backgroundColor: '#4CAF50',
	},
	copyButtonText: {
		fontSize: 14,
	},
	copyAllButton: {
		backgroundColor: '#9C27B0',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
		alignSelf: 'flex-start',
	},

	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 50,
	},
	emptyText: {
		color: '#888',
		fontSize: 14,
	},


	// Cache Update Styles
	cacheUpdateItem: {
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	cacheUpdateText: {
		color: '#fff',
	},

	// Search Styles
	searchInput: {
		flex: 1,
		color: '#fff',
		fontSize: 14,
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: '#2d2d2d',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#444',
	},
	clearSearchButton: {
		padding: 4,
	},
	navButton: {
		paddingHorizontal: 8,
		paddingVertical: 5,
		backgroundColor: '#2d2d2d',
		borderRadius: 4,
	},
});