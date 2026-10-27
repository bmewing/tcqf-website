const fs = require('fs');
const path = require('path');

function main(args) {
    const type = args.type || 'manifest';
    const year = args.year;
    const speakerId = args.id;

    const scheduleDir = path.join(__dirname, 'schedule');
    const speakersDir = path.join(__dirname, 'speakers');

    // CORS headers to ensure the API can be accessed from any source if needed
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (type === 'manifest') {
        try {
            // Read schedule files to determine available years dynamically
            let years = [];
            if (fs.existsSync(scheduleDir)) {
                const scheduleFiles = fs.readdirSync(scheduleDir);
                years = scheduleFiles
                    .filter(file => file.endsWith('.json'))
                    .map(file => file.replace('.json', ''))
                    .sort((a, b) => b.localeCompare(a)); // Sort descending (most recent first)
            }

            // Read speaker files to determine available speaker IDs dynamically
            let speakers = [];
            if (fs.existsSync(speakersDir)) {
                const speakerFiles = fs.readdirSync(speakersDir);
                speakers = speakerFiles
                    .filter(file => file.endsWith('.json'))
                    .map(file => file.replace('.json', ''));
            }

            return {
                statusCode: 200,
                headers: headers,
                body: { years, speakers }
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers: headers,
                body: { error: 'Failed to dynamically generate manifest', details: e.message }
            };
        }
    }

    if (type === 'schedule') {
        if (!year) {
            return {
                statusCode: 400,
                headers: headers,
                body: { error: 'Parameter "year" is required' }
            };
        }
        try {
            const filePath = path.join(scheduleDir, `${year}.json`);
            if (!fs.existsSync(filePath)) {
                return {
                    statusCode: 404,
                    headers: headers,
                    body: { error: `Schedule for year ${year} not found` }
                };
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.parse(data)
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers: headers,
                body: { error: `Failed to load schedule for ${year}`, details: e.message }
            };
        }
    }

    if (type === 'speaker') {
        if (!speakerId) {
            return {
                statusCode: 400,
                headers: headers,
                body: { error: 'Parameter "id" is required for speaker lookups' }
            };
        }
        try {
            const filePath = path.join(speakersDir, `${speakerId}.json`);
            if (!fs.existsSync(filePath)) {
                return {
                    statusCode: 404,
                    headers: headers,
                    body: { error: `Speaker ${speakerId} not found` }
                };
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.parse(data)
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers: headers,
                body: { error: `Failed to load speaker ${speakerId}`, details: e.message }
            };
        }
    }

    if (type === 'speakers') {
        try {
            let speakers = [];
            if (fs.existsSync(speakersDir)) {
                speakers = fs.readdirSync(speakersDir)
                    .filter(file => file.endsWith('.json'))
                    .map(file => JSON.parse(fs.readFileSync(path.join(speakersDir, file), 'utf8')));
            }
            return {
                statusCode: 200,
                headers: headers,
                body: speakers
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers: headers,
                body: { error: 'Failed to load speakers', details: e.message }
            };
        }
    }

    return {
        statusCode: 400,
        headers: headers,
        body: { error: `Unknown request type: ${type}` }
    };
}

exports.main = main;
