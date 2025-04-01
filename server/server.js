import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', (req, res) => {
    res.send('This is our great crime app.');
})

const server = app.listen(PORT, () => {
    console.log(`server listening on PORT ${PORT}`);
})