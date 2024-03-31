Data processing!! 🚀
Welcome to the Data Processing repository! This project intends to provide a comprehensive solution for managing file uploads, processing CSV data, and creating import process reports. Using Express.js and SQLite, this application provides a stable and fast framework for managing data import activities.

OVERVIEW: ✨
In today's data-driven world, businesses and organizations of all sizes require effective data management and processing. This repository provides a solution for streamlining the process of importing data from CSV files into a SQLite database while also offering significant insights into the imported data via summary reports.

FEATURES :👩‍💻
File Uploads: Upload CSV files using a designated endpoint (/upload) with support for error handling and validation.

CSV Data Processing: 🗂️
Process uploaded CSV files to insert records into SQLite tables. The application parses CSV data using the csv-parser library.

Summary Generation:🧾
Retrieve a summary of the import process, including counts of records for each table and total import time, using the /summary endpoint.

Proper Error Handling:❌
The application incorporates error handling and validation to ensure robustness during file uploads and database operations.


Dependencies : 🔗
The following dependencies are utilized in this project:

Multer: Middleware for handling multipart/form-data file uploads.
SQLite3: Asynchronous, non-blocking SQLite3 bindings for Node.js.
csv-parser: CSV parsing and processing library for Node.js.
fs: Node.js built-in module for file system operations.
