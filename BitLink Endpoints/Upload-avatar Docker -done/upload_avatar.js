const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const upload = multer({
  limits: { fileSize: 5000000 }, // Limit filesize up to 5MB
});

const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/upload_avatar', upload.fields([
    { name: 'avatar' }, 
    { name: 'avatarPage' }, 
    { name: 'thumbnail_url' }
]), async (req, res) => {
    try {
        const file = req.files['avatar'] || req.files['avatarPage'] || req.files['thumbnail_url'];
        const db_key = file ? file[0].fieldname : null;
        const link_uid = req.body.link_uid || null;

        if (!file || !db_key) {
            res.status(400).send({ message: 'No file part' });
            return;
        }

        if (!['.png', '.jpg', '.jpeg', '.gif'].includes(path.extname(file[0].originalname).toLowerCase())) {
            res.status(400).send({ message: 'Invalid file type' });
            return;
        }

        const idToken = req.headers.authorization.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        let filename = `${uid}_${db_key}`;
        if (link_uid) {
            filename += `_${link_uid}`;
        }
        filename += `${path.extname(file[0].originalname)}`;

        const bucket = admin.storage().bucket();
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (err) => {
            console.error(err);
            res.status(500).send({ message: 'Something went wrong while uploading the file.' });
        });

        blobStream.on('finish', async () => {
            const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
            const ref = admin.database().ref('users');
            if (db_key === 'thumbnail_url') {
                await ref.child(`${uid}/links/${link_uid}`).update({ [db_key]: avatarUrl });
            } else {
                await ref.child(uid).update({ [db_key]: avatarUrl });
            }
            res.status(200).send({ message: 'File uploaded successfully', file_url: avatarUrl });
        });

        blobStream.end(file[0].buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});