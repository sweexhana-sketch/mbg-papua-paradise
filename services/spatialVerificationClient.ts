import * as turf from '@turf/turf';

// Load provincial roads data from public folder
async function loadProvincialRoads() {
    try {
        const response = await fetch('/data/jlnprov.json');
        if (!response.ok) {
            throw new Error('Failed to load provincial roads data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading road data:', error);
        return { type: 'FeatureCollection', features: [] };
    }
}

// Check if point is on provincial road
export async function verifyLocation(
    lat: number,
    lng: number,
    thresholdInKm: number = 0.1
): Promise<{ result: boolean; roadName?: string; distance?: number }> {
    try {
        const provincialRoads = await loadProvincialRoads();
        const pt = turf.point([lng, lat]);
        let minDistance = Infinity;
        let nearestRoadName = 'Unknown Road';

        for (const feature of provincialRoads.features) {
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
            roadName: isOnRoad ? nearestRoadName : undefined,
            distance: minDistance
        };
    } catch (error) {
        console.error('Verification error:', error);
        return { result: false };
    }
}

// Format verification result for display
export function formatVerificationResult(verification: { result: boolean; roadName?: string }): string {
    if (verification.result) {
        return `✅ JALAN PROVINSI - ${verification.roadName}`;
    } else {
        return `⚖️ BUKAN JALAN PROVINSI - Akan diteruskan ke instansi terkait`;
    }
}
