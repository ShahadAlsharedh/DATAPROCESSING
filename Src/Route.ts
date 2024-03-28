import { type Request, type Response } from 'express';
import {
    AccountRequest,
    InspectionRequest,
    NewActivity,
    NewLicense,
    StampLicense
} from './Tables'; 
import db from '../Data/Connect';

const getAccountRequests = async (req: Request, res: Response) => {
    try {
        const accountRequests = await db
        .select()
        .from(AccountRequest)
        .execute();

    accountRequests.forEach(accountRequest => {
        accountRequest.Permission = JSON.parse(
            accountRequest.Permission ?? ''
        );
    });

    res.status(200).json({ ...accountRequests });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getInspectionRequests = async (req: Request, res: Response) => {
            const inspectionRequests = await db
            .select()
            .from(InspectionRequest)
            .execute();

        res.status(200).json(inspectionRequests);
    } ;


const getNewActivities = async (req: Request, res: Response) => {
    try {
        const newActivities = await db
            .select()
            .from(NewActivity)
            .execute();

        newActivities.forEach((newActivity: { Activities: any }) => {
            newActivity.Activities = JSON.parse(newActivity.Activities ?? '');
        });

        res.status(200).json(newActivities);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getNewLicenses = async (req: Request, res: Response) => {
    try {
        const newLicenses = await db
            .select()
            .from(NewLicense)
            .execute();

        res.status(200).json(newLicenses);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStampLicenses = async (req: Request, res: Response) => {
    try {
        const stampLicenses = await db
            .select()
            .from(StampLicense)
            .execute();

        res.status(200).json(stampLicenses);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export {
    getAccountRequests,
    getInspectionRequests,
    getNewActivities,
    getNewLicenses,
    getStampLicenses
};
