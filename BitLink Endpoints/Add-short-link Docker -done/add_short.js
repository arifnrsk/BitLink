const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');

// Firebase Initialization
const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

const db = admin.database();
const app = express();
app.use(express.json());
app.use(cors());

app.post('/add_short_link', async (req, res) => {
    const title = req.body.title;
    const link = req.body.link;
    const shortLink = req.body.shortLink;

    const idToken = req.headers.authorization.split(' ').pop();
    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch(e) {
        res.status(401).send({message: "Unauthorized access."});
        return;
    }

    const uid = decodedToken.uid;

    if (!title || !link || !shortLink) {
        res.status(400).send({ error: 'Title, link and shortLink are required.' });
        return;
    }

    try {
        const ref = db.ref(`users/${uid}/shortLinks`);
        ref.push({
            title: title,
            url: link,
            shortLink: shortLink
        });
        res.status(200).send({message: 'Short link added successfully.', shortLink: shortLink});
    } catch(e) {
        res.status(500).send({message: e.toString()});
    }
});

app.post('/check_short_link', async (req, res) => {
    const shortLink = req.body.shortLink;
    const idToken = req.headers.authorization.split(' ').pop();

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (!shortLink) {
            res.status(400).send({ error: 'ShortLink is required.' });
            return;
        }

        const snapshot = await db.ref(`users/${uid}/shortLinks`).once('value');
        const shortLinks = snapshot.val();
        const exists = Object.values(shortLinks || {}).some((link) =>
            link.shortLink.toLowerCase() === shortLink.toLowerCase()
        );
        res.status(200).send({ exists: exists });
    } catch (e) {
        res.status(500).send({ message: e.toString() });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));