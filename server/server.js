import express from 'express';
import crimeRecordRoutes from './routes/crimeRecordRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', crimeRecordRoutes);

const server = app.listen(PORT, () => {
    console.log(`server listening on PORT ${PORT}`);
})