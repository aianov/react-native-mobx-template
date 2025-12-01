import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export interface DeviceMetadata {
	device_info: string;
	device_type: string;
	platform: string;
	user_agent: string;
	browser: boolean;
}

let cachedDeviceMetadata: DeviceMetadata | null = null;

export async function getDeviceMetadata(): Promise<DeviceMetadata> {
	if (cachedDeviceMetadata) {
		return cachedDeviceMetadata;
	}

	try {
		const deviceName = await DeviceInfo.getDeviceName();
		const systemVersion = DeviceInfo.getSystemVersion();
		const brand = DeviceInfo.getBrand();
		const model = DeviceInfo.getModel();
		const deviceId = await DeviceInfo.getUniqueId();

		const device_info = `${brand} ${model} (${deviceName})`;

		const isTablet = DeviceInfo.isTablet();
		const device_type = isTablet ? 'tablet' : 'mobile';

		const platform = Platform.OS === 'ios' ? 'ios' : 'android';

		const user_agent = `${brand}/${model} ${Platform.OS}/${systemVersion} (${deviceId})`;

		const browser = false;

		cachedDeviceMetadata = {
			device_info,
			device_type,
			platform,
			user_agent,
			browser,
		};

		return cachedDeviceMetadata;
	} catch (error) {
		console.error('Error getting device metadata:', error);

		return {
			device_info: `${Platform.OS} device`,
			device_type: 'mobile',
			platform: Platform.OS === 'ios' ? 'ios' : 'android',
			user_agent: `${Platform.OS}/${Platform.Version}`,
			browser: false,
		};
	}
}

export function clearDeviceMetadataCache() {
	cachedDeviceMetadata = null;
}

