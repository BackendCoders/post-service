import axios from 'axios';

export async function postcodeToLatLng(postcode) {
	const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`;

	try {
		const { data } = await axios.get(url);

		if (!data || data.status !== 200) {
			throw new Error(`Invalid postcode: ${postcode}`);
		}

		return {
			lat: data.result.latitude,
			lng: data.result.longitude,
		};
	} catch (error) {
		if (error.response?.status === 404) {
			throw new Error(`Postcode not found: ${postcode}`);
		}
		if (error.response?.status === 400) {
			throw new Error(`Invalid postcode format: ${postcode}`);
		}
		if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
			throw new Error('Failed to connect to postcode service');
		}
		throw error;
	}
}
