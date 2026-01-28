import axios from 'axios';

const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

const fetch_distance = async (coordinates) => {
	return axios.post(
		ORS_URL,
		{
			coordinates,
			instructions: true,
			geometry: false,
		},
		{
			headers: {
				'Authorization': process.env.ORS_API_KEY,
				'Content-Type': 'application/json',
			},
		},
	);
};

const formatDuration = (minutes) => {
	const hrs = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);

	if (hrs === 0) return `${mins} min`;
	if (mins === 0) return `${hrs} hr`;
	return `${hrs} hr ${mins} min`;
};

export async function getRoadDistance(coordinates) {
	try {
		if (!coordinates || coordinates.length < 2) {
			throw new Error('At least 2 coordinates are required');
		}

		const response = await fetch_distance(coordinates);
		const response_return = await fetch_distance([
			coordinates[0],
			coordinates.at(-1),
		]);

		const route = response.data.routes?.[0];
		const route_return = response_return.data.routes?.[0];

		if (!route || !route_return) {
			throw new Error('No route found from OpenRouteService');
		}

		// ---- Distances ----
		const distance_trip_meter = route.summary.distance;
		const distance_dead_meter = route_return.summary.distance;

		const distance_trip_miles = +(distance_trip_meter / 1609.344).toFixed(2);
		const distance_dead_miles = +(distance_dead_meter / 1609.344).toFixed(2);
		const distance_total_miles = +(
			distance_trip_miles + distance_dead_miles
		).toFixed(2);

		// ---- Durations ----
		const duration_trip_min = +(route.summary.duration / 60).toFixed(2);
		const duration_dead_min = +(route_return.summary.duration / 60).toFixed(2);
		const duration_total_min = +(duration_trip_min + duration_dead_min).toFixed(
			2,
		);

		const duration_trip_text = formatDuration(duration_trip_min);
		const duration_dead_text = formatDuration(duration_dead_min);
		const duration_total_text = formatDuration(duration_total_min);

		return {
			distance_trip_meter,
			distance_trip_miles,
			duration_trip_min,
			duration_trip_text,

			distance_dead_meter,
			distance_dead_miles,
			duration_dead_min,
			duration_dead_text,

			distance_total_miles,
			duration_total_min,
			duration_total_text,

			distance_total_text: `${distance_total_miles} miles (${distance_trip_miles} trip + ${distance_dead_miles} dead)`,
			duration_text: `${duration_total_text} (${duration_trip_text} trip + ${duration_dead_text} dead)`,

			steps: route.segments?.[0]?.steps || [],
		};
	} catch (error) {
		if (error.response?.status === 401) {
			throw new Error('Invalid ORS API key');
		}
		if (error.response?.status === 400) {
			throw new Error('Invalid coordinates provided');
		}
		if (error.code === 'ECONNREFUSED') {
			throw new Error('Failed to connect to OpenRouteService');
		}
		throw error;
	}
}
