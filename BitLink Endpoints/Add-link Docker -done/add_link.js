const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

app.post('/add_link', async (req, res) => {
    const data = req.body;
    const title = data.title;
    const link = data.link;
    const thumbnail_url = data.thumbnail_url;

    // User's id token
    const idToken = req.headers.authorization.split(' ').pop();
    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
        return res.status(403).send('Unauthorized access');
    }
    const uid = decodedToken.uid;

    // Validate data
    if (!title || !link || !thumbnail_url) {
        return res.status(400).json({error: 'Title, link and thumbnail_url are required.'});
    }

    try {
        // Add link to Firebase Realtime Database
        const ref = admin.database().ref(`users/${uid}/links`);
        ref.push({
            'title': title,
            'link': link,
            'thumbnail_url': thumbnail_url
        });

        return res.status(200).json({message: 'Link added successfully.'});
    } catch (e) {
        return res.status(500).json({message: e.toString()});
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));