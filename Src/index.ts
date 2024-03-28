import express, { type Request, type Response } from 'express';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const app = express();
const port = 3000;

const db = new sqlite3.Database(':memory:');
const createTables = () => {
    db.exec(`CREATE TABLE IF NOT EXISTS AccountRequest (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        RequestName TEXT, 
        ApplicantName TEXT, 
        Username TEXT, 
        ContactEmail TEXT, 
        Permission TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS InspectionRequest (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        InspectionDate TEXT,
        InspectionTime TEXT,
        InspectionType TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS NewLicence (
        RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
        CompanyName TEXT,
        LicenceType TEXT,
        IsOffice BOOLEAN,
        OfficeName TEXT,
        OfficeServiceNumber TEXT,
        RequestDate TEXT,
        Activities TEXT
    )`);
    


    db.exec(`CREATE TABLE IF NOT EXISTS AddActivityRequest (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT,
        LicenceID TEXT,
        Activities TEXT
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS StampLicenseLetterRequest (
        RequestID INTEGER PRIMARY KEY,
        CompanyName TEXT, 
        LicenceID TEXT, 
        RequestDate TEXT
    )`);
};

const processCSV = (filePath: string) => {
    const parser = csv();
    const data: { [key: string]: any[] } = {};
    let startTime = Date.now();
    let isHeaderChecked = false;

    parser.on('data', (row: any) => {
        if (!isHeaderChecked) {
        
            const expectedHeaders = ['RequestID', 'RequestType', 'RequestStatus', 'RequestData'];
            const actualHeaders = Object.keys(row);
            if (!expectedHeaders.every(header => actualHeaders.includes(header))) {
                console.error('CSV file structure does not match the expected structure.');
                parser.end();
                return;
            }
            isHeaderChecked = true;
        }
        const { requestType, requestID, requestStatus, requestData } = row;
        if (!data[requestType]) {
            data[requestType] = [];
        }
        data[requestType].push({ requestID, requestStatus, requestData });
    });

    parser.on('end', () => {
        for (const [requestType, records] of Object.entries<any[]>(data)) {
            const table = getRequestTableName(parseInt(requestType));
            if (table) {
                const values = records.map((record: any) => `(${record.requestID}, ${record.requestStatus}, '${record.requestData}')`).join(',');
                db.exec(`INSERT INTO ${table} (requestID, requestStatus, requestData) VALUES ${values}`);
            }
        }
        let endTime = Date.now();
        let totalTime = (endTime - startTime) / 1000; 
        console.log(`Imported ${Object.keys(data).length} types of records in ${totalTime} seconds.`);
    });

    fs.createReadStream(filePath)
        .on('error', err => {
            console.error('Error reading the file:', err);
            parser.end();
        })
        .pipe(parser);
};

const getRequestTableName = (requestType: number): string | undefined => {
    switch (requestType) {
        case 1:
            return 'AccountRequest ';
        case 2:
            return 'InspectionRequest';
        case 3:
            return 'NewLicence';
        case 4:
            return 'AddActivityRequest';
        case 5:
            return 'StampLicenseLetterRequest';
        default:
            return undefined;
    }
};



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const upload = multer({
    dest: 'uploads/',
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'text/csv') {
            cb(new Error('Only CSV files are allowed.'));
        } else {
            cb(null, true);
        }
    }
}).single('csvFile');


app.post('/upload', (req: Request, res: Response) => {
    upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err.message);
            return res.status(400).send('File upload failed.');
        } else if (err) {

            console.error('File upload error:', err.message);
            return res.status(500).send('Internal Server Error.');
        }

        const file = (req as any).file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = file.path;
        createTables();
        processCSV(filePath);

        res.send('File uploaded and processed successfully.');
    });
});

const fetchCount = (tableName: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS count FROM ${tableName}`, (err, row: { count: number }) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
};

// Function to calculate total time
const calculateTotalTime = (startTime: [number, number]): number => {
    const endTime = process.hrtime(startTime); // End time
    return (endTime[0] * 1e9 + endTime[1]) / 1e6; // Convert to milliseconds
};

app.get('/summary', async (req: Request, res: Response) => {
    const startTime = process.hrtime(); // Start time

    // Fetch counts for each table concurrently
    const fetchPromises: Promise<number>[] = [
        fetchCount("AccountRequest"),
        fetchCount("InspectionRequest"),
        fetchCount("NewLicence"),
        fetchCount("AddActivityRequest"),
        fetchCount("StampLicenseLetterRequest")
    ];

    try {
        // Wait for all promises to resolve
        const counts = await Promise.all(fetchPromises);
        
        // Calculate total time
        const totalTime = calculateTotalTime(startTime);

        // Construct summary object
        const summary = {
            AccountRequest: counts[0],
            InspectionRequest: counts[1],
            NewLicense: counts[2],
            AddActivityRequest: counts[3],
            StampLicenseLetterRequest: counts[4],
            Total: counts.reduce((acc, curr) => acc + curr, 0 as number),
            TotalTime: totalTime
        };

        // Send summary as JSON response
        res.json(summary);
    } catch (error) {
        console.error('Error fetching counts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});