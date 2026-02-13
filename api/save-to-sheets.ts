// api/save-to-sheets.ts
// Serverless function to save complaint data to Google Sheets
import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            timestamp,
            reporterPhone,
            location,
            coordinates,
            latitude,
            longitude,
            verificationStatus,
            roadName,
            description,
            photoUrl,
            status
        } = req.body;

        // Get credentials from environment variables
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '19nBEvIxf5GYiC_O0Wyy-AhodTu9LJy58mKypGP0kPRY';

        if (!privateKey || !clientEmail) {
            console.error('Missing Google Sheets credentials');
            return res.status(500).json({
                error: 'Google Sheets credentials not configured',
                details: 'Please set GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_CLIENT_EMAIL in Vercel Environment Variables'
            });
        }

        // Authenticate with Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Prepare row data
        const rowData = [
            timestamp || new Date().toISOString(),
            reporterPhone || '-',
            location || '-',
            coordinates || '-',
            latitude || '-',
            longitude || '-',
            verificationStatus || '-',
            roadName || '-',
            description || '-',
            photoUrl || '-',
            status || 'Baru'
        ];

        // Append row to spreadsheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:K', // Adjust sheet name if needed
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData],
            },
        });

        console.log('Successfully saved to Google Sheets');

        return res.status(200).json({
            success: true,
            message: 'Complaint saved to Google Sheets'
        });
    } catch (error: any) {
        console.error('Error saving to Google Sheets:', error);
        return res.status(500).json({
            error: 'Failed to save to Google Sheets',
            details: error.message
        });
    }
}
