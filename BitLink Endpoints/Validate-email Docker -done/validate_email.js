const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

app.post('/validate_email', async (req, res) => {
    const email = req.body.email;

    try {
        await admin.auth().getUserByEmail(email);
        res.status(400).send({ message: 'Email already registered!' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
        res.status(200).send({ message: 'Email not registered!' });
        } else {
        res.status(400).send({ message: error.message });
        }
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on port ${port}`));