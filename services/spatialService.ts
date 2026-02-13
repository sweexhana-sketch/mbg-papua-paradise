import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';

/**
 * Service to verify if a coordinate belongs to Provincial Roads (Jalan Provinsi)
 */
export class SpatialVerificationService {
    private static provincialRoads: any = null;

    private static loadData() {
        if (this.provincialRoads) return;

        try {
            // Path relative to the API function in Vercel
            const filePath = path.join(process.cwd(), 'public', 'data', 'jlnprov.json');
            const data = fs.readFileSync(filePath, 'utf8');
            this.provincialRoads = JSON.parse(data);
            console.log('SpatialService: Provincial roads data loaded successfully');
        } catch (error) {
            console.error('SpatialService: Error loading road data:', error);
            this.provincialRoads = { type: 'FeatureCollection', features: [] };
        }
    }

    /**
     * Checks if a point is near a provincial road
     * @param lat Latitude
     * @param lng Longitude
     * @param thresholdInKm Distance tolerance (default 0.1km or 100m)
     */
    public static isPointOnProvincialRoad(lat: number, lng: number, thresholdInKm: number = 0.1): { result: boolean, roadName?: string } {
        this.loadData();

        const pt = turf.point([lng, lat]);
        let minDistance = Infinity;
        let nearestRoadName = 'Unknown Road';

        for (const feature of this.provincialRoads.features) {
            if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                const distance = turf.pointToLineDistance(pt, feature);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestRoadName = feature.properties?.Nm_Ruas || 'Ruas Jalan Tanpa Nama';
                }
            }
        }

        const isOnRoad = minDistance <= thresholdInKm;

        return {
            result: isOnRoad,
            roadName: isOnRoad ? nearestRoadName : undefined
        };
    }
}
