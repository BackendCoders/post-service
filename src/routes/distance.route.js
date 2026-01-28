import express from 'express';
import { postcodeToLatLng } from '../services/postcodes.service.js';
import { getRoadDistance } from '../services/ors.service.js';

const router = express.Router();

/**
 * POST /api/distance
 * {
 *   "from": "BA8 0EH",
 *   "to": "BA12 8DL",
 *   "vias": ["BA9 8AA"]
 * }
 */
router.post('/', async (req, res) => {
	try {
		const { from, to, vias = [] } = req.body;

		if (!from || !to) {
			return res.status(400).json({
				error: '`from` and `to` postcodes are required',
			});
		}

		const postcodes = [from, ...vias, to];

		// Convert postcodes → lat/lng
		const locations = await Promise.all(postcodes.map(postcodeToLatLng));

		// ORS expects [lng, lat]
		const coordinates = locations.map((loc) => [loc.lng, loc.lat]);

		const result = await getRoadDistance(coordinates);

		res.json({
			route: postcodes,
			...result,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: error.message || 'Internal server error',
		});
	}
});

export default router;
