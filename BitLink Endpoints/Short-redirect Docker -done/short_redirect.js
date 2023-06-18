const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();

const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

const db = admin.database();

app.use(cors());

app.get('/:short_link', async (req, res) => {
    let short_link = req.params.short_link;
    let ref = db.ref('users');
    let snapshot = await ref.once('value');
    let users = snapshot.val();

    for (let user in users) {
        if (users[user].shortLinks) {
            for (let link in users[user].shortLinks) {
                let actual_short_link = users[user].shortLinks[link].shortLink.split("/").pop();
                if (actual_short_link === short_link) {
                    return res.redirect(users[user].shortLinks[link].url);
                }
            }
        }
    }

    res.send("Short link does not exist.");
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});