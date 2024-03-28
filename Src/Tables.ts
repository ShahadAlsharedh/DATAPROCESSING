import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

const AccountRequest = sqliteTable('AccountRequest', {
    RequestID: integer('RequestID').primaryKey(),
    CompanyName: text('CompanyName'),
    RequestName: text('RequestName'),
    ApplicantName: text('ApplicantName'),
    Username: text('Username'),
    ContactEmail: text('ContactEmail'),
    Permission: text('Permission')
});

const InspectionRequest = sqliteTable('InspectionRequest', {
    RequestID: integer('RequestID').primaryKey(),
    CompanyName: text('CompanyName'),
    InspectionDate: text('InspectionDate'),
    InspectionTime: text('InspectionTime'),
    InspectionType: text('InspectionType')
});

const NewLicense = sqliteTable('NewLicense', {
    RequestID: integer('RequestID').primaryKey(),
    CompanyName: text('CompanyName'),
    LicenceType: text('LicenceType'),
    IsOffice: text('IsOffice'),
    OfficeName: text('OfficeName'),
    OfficeServiceNumber: text('OfficeServiceNumber'),
    RequestDate: text('RequestDate'),
    Activities: text('Activities')
});

const NewActivity = sqliteTable('AddActivityRequest', {
    RequestID: integer('RequestID').primaryKey(),
    CompanyName: text('CompanyName'),
    LicenceID: text('LicenceID'),
    Activities: text('Activities')
});

const StampLicense = sqliteTable('StampLicenseLetterRequest', {
    RequestID: integer('RequestID').primaryKey(),
    CompanyName: text('CompanyName'),
    LicenceID: text('LicenceID'),
    RequestDate: text('RequestDate')
});

export {
    AccountRequest,
    InspectionRequest,
    NewActivity,
    NewLicense,
    StampLicense
};
