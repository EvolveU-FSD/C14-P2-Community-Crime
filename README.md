# C14-P2-Community-Crime
Working with City of Calgary public API data, we are building an application to better view the information.

This API has been deprecated and so all data will only be reflected up to November of 2024. For up to date information, view the [City of Calgary Police Dashboard](https://data.calgarypolice.ca/).

---
## Server Quick Start
```bash
cd server
npm install
npm run dev
```

## Client Quick Start
```bash
cd client
npm install
npm run dev
```


## Environment Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Create a `.env` file by copying `.env.example`:
```bash
copy .env.example .env
```

3. Update the `.env` file with your MongoDB connection string:
```properties
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

Replace:
- `<username>`: Your MongoDB username
- `<password>`: Your MongoDB password
- `<cluster>`: Your cluster URL
- `<database>`: Your database name (e.g., c14-P2-Crimes)

Note: The `.env` file is ignored by git to protect sensitive information. Never commit your actual credentials.

## Execution
Navigate to [http://localhost:5173/](http://localhost:5173/) to view your local environment.
