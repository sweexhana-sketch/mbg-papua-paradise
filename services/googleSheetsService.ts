// Service for logging complaints to Google Sheets

export interface ComplaintData {
    timestamp: string;
    reporterPhone?: string;
    location: string;
    coordinates: string;
    latitude?: number;
    longitude?: number;
    verificationStatus: string;
    roadName?: string;
    description: string;
    photoUrl?: string;
    status: 'Baru' | 'Proses' | 'Selesai';
}

export async function saveToGoogleSheets(data: ComplaintData): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/save-to-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to save to Google Sheets');
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
