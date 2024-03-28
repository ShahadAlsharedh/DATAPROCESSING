import { type Request, type Response } from 'express';
import {
    AccountRequest,
    InspectionRequest,
    NewActivity,
    NewLicense,
    StampLicense
} from './Tables'; 
import db from '../Data/Connect';


const getAccountRequestsCount = async (): Promise<number> => {
    try {
        const accountRequests: any[] = await db
            .select()
            .from(AccountRequest) // Pass the table name as a string
            .execute();

        return accountRequests.length;
    } catch (error) {
        console.error('Error fetching account requests count:', error);
        throw new Error('Internal Server Error');
    }
};

// For InspectionRequest table
const getInspectionRequestsCount = async (): Promise<number> => {
    try {
        const inspectionRequests = await db
            .select()
            .from(InspectionRequest)
            .execute();

        return inspectionRequests.length;
    } catch (error) {
        console.error('Error fetching inspection requests count:', error);
        throw new Error('Internal Server Error');
    }
};

// For NewLicense table
const getNewLicensesCount = async (): Promise<number> => {
    try {
        const newLicenses = await db
            .select()
            .from(NewLicense)
            .execute();

        return newLicenses.length;
    } catch (error) {
        console.error('Error fetching new licenses count:', error);
        throw new Error('Internal Server Error');
    }
};

// For AddActivityRequest table
const getAddActivityRequestsCount = async (): Promise<number> => {
    try {
        const addActivityRequests = await db
            .select()
            .from(NewActivity)
            .execute();

        return addActivityRequests.length;
    } catch (error) {
        console.error('Error fetching add activity requests count:', error);
        throw new Error('Internal Server Error');
    }
};

// For StampLicenseLetterRequest table
const getStampLicenseRequestsCount = async (): Promise<number> => {
    try {
        const stampLicenseRequests = await db
            .select()
            .from(StampLicense)
            .execute();

        return stampLicenseRequests.length;
    } catch (error) {
        console.error('Error fetching stamp license requests count:', error);
        throw new Error('Internal Server Error');
    }
};

export {
    getAccountRequestsCount,
    getInspectionRequestsCount,
    getNewLicensesCount,
    getAddActivityRequestsCount,
    getStampLicenseRequestsCount
};
