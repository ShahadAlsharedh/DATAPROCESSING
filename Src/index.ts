import express, { type Request, type Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { 
    getAccountRequestsCount,
    getInspectionRequestsCount,
    getNewLicensesCount,
    getAddActivityRequestsCount,
    getStampLicenseRequestsCount
} from './count.ts';
import db from '../Data/Connect.ts';

const app = express();
const port = 3000;

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


const getRequestTableName = (requestType: number): string | undefined => {
    switch (requestType) {
        case 1:
            return 'AccountRequest';
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


const processCSV = (filePath: string) => {
    const parser = csv();
    const data: { [key: string]: any[] } = {};
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
        const { RequestType, RequestID, RequestStatus, RequestData } = row; 
        if (!data[RequestType]) {
            data[RequestType] = [];
        }
        data[RequestType].push({ RequestID, RequestStatus, RequestData }); 
    });

    parser.on('end', () => {
        try {
            for (const [requestType, records] of Object.entries<any[]>(data)) {
                const table = getRequestTableName(parseInt(requestType));
                if (table) {
                    let count = 0;
                    for (const record of records) {
                        db.run(`INSERT INTO ${table} (RequestID, RequestType, RequestStatus, RequestData) VALUES (?, ?, ?, ?)`,
                            [record.RequestID, record.RequestType, record.RequestStatus, record.RequestData]);
                        count++;
                    }
                    console.log(`Inserted ${count} records into ${table}.`);
                }
            }
        } catch (error) {
            console.error('Error processing CSV:', error);
        }
    });

    fs.createReadStream(filePath)
        .on('error', err => {
            console.error('Error reading the file:', err);
            parser.end();
        })
        .pipe(parser);
};


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
        processCSV(filePath);

        res.send('File uploaded and processed successfully.');
    });
});


app.get('/summary', async (req: Request, res: Response) => {
    try {
        const [
            accountRequestsCount,
            inspectionRequestsCount,
            newLicensesCount,
            addActivityRequestsCount,
            stampLicenseRequestsCount
        ] = await Promise.all([
            getAccountRequestsCount(),
            getInspectionRequestsCount(),
            getNewLicensesCount(),
            getAddActivityRequestsCount(),
            getStampLicenseRequestsCount()
        ]);

        const total = accountRequestsCount + inspectionRequestsCount + newLicensesCount + addActivityRequestsCount + stampLicenseRequestsCount;

        const summary = {
            AccountRequest: accountRequestsCount,
            InspectionRequest: inspectionRequestsCount,
            NewLicense: newLicensesCount,
            AddActivityRequest: addActivityRequestsCount,
            StampLicenseLetterRequest: stampLicenseRequestsCount,
            Total: total
        };

        res.json(summary);
    } catch (error) {
        console.error('Error fetching counts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
