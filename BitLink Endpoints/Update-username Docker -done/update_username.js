// update_username.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

app.post('/update_username', async (req, res) => {
    const username = req.body.username;
    const idToken = req.headers.authorization.split(' ').pop();

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const ref = admin.database().ref('users');
        await ref.child(uid).update({ username });

        return res.status(200).json({ message: 'Username updated successfully.' });
    } catch (e) {
        return res.status(500).json({ message: String(e) });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});