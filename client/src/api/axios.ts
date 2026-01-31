import axios, { type CreateAxiosDefaults } from 'axios';
import { queryClient } from '../main';
import { navigate } from '@/lib/navigate';
import { decryptResponseData, encryptRequestData } from '@/lib/encryption';

const UNAUTHORIZED = 401;

const options: CreateAxiosDefaults = {
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
};

const axiosInstance = axios.create(options);

// create a separate client for refreshing the access token
// to avoid infinite loops with the error interceptor
const TokenRefreshClient = axios.create(options);

axiosInstance.interceptors.response.use(
	async (response) => {
		if (response?.data?.data) {
			// console.log('received data: ', response.data.data);
			response.data.data = await decryptResponseData(response.data.data);
		}
		return response;
	},
	async (error) => {
		const { config, response } = error;
		const { status, data } = response || {};

		// try to refresh the access token behind the scenes
		if (status === UNAUTHORIZED && data?.errorCode === 'InvalidAccessToken') {
			try {
				// refresh the access token, then retry the original request
				await TokenRefreshClient.get('/auth/refresh');
				return TokenRefreshClient(config);
			} catch (error) {
				// handle refresh errors by clearing the query cache & redirecting to login
				queryClient.clear();
				navigate('/login', {
					state: {
						redirectUrl: window.location.pathname,
					},
				});
			}
		}

		return Promise.reject({ status, ...data });
	},
);

axiosInstance.interceptors.request.use((config) => {
	if (config.data) {
		// config.data = encryptRequestData(config.data);
		// console.log('data to send: ', config.data);
	}
	return config;
});

export default axiosInstance;
