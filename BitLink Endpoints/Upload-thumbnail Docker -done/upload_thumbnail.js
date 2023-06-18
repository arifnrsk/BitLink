const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const admin = require('firebase-admin');
const path = require('path');

// Setup firebase
const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

const bucket = admin.storage().bucket();

// Setup express
const app = express();

app.use(cors());
app.use(fileUpload());

app.post('/upload_thumbnail', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({message: 'No files were uploaded.'});
    }

    let thumbnail = req.files.thumbnail;
    let idToken = req.headers.authorization.split(' ').pop();

    try {
        let decodedToken = await admin.auth().verifyIdToken(idToken);
        let uid = decodedToken.uid;
        
        if (!['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].includes(thumbnail.mimetype)) {
            return res.status(400).send({message: 'Invalid file type.'});
        }

        let timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
        let filename = `${uid}_thumbnail_${timestamp}${path.extname(thumbnail.name)}`;

        const file = bucket.file(filename);
        const stream = file.createWriteStream({
            metadata: {
                contentType: thumbnail.mimetype
            }
        });

        stream.on('error', (err) => {
            thumbnail.tempFilePath = '';
            res.status(500).send({ message: 'Something went wrong while uploading the file.' });
        });

        stream.on('finish', async () => {
            try {
                await file.makePublic();

                let publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

                res.send({
                    message: 'Thumbnail uploaded successfully',
                    thumbnail_url: publicUrl
                });
            } catch (err) {
                res.status(500).send({message: 'Something went wrong setelah finish.'});
            }
        });

        stream.end(thumbnail.data);

    } catch (err) {
        res.status(500).send({message: 'Failed to authenticate.'});
    }
});

app.listen(8080, () => {
    console.log('Server started on port 8080');
});