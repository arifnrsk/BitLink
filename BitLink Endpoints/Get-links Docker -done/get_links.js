const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

const app = express();

// Enable CORS for all routes
app.use(cors());

app.get('/get_links', async (req, res) => {
    // Verify the token in the Authorization header with Firebase
    const token = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get links data from Firebase Realtime Database
    const db = admin.database();
    const ref = db.ref(`users/${uid}/links`);
    ref.once('value', (snapshot) => {
        const links = snapshot.val();
        console.log(links);
        res.json(links);
    });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});