const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
  storageBucket: 'bitlink-image-source/www'
});

const bucket = admin.storage().bucket();

// Create Express server and enable CORS
const app = express();
app.use(cors());

// Create an endpoint that accepts a filename and returns the download URL
app.get('/url/:filename', async (req, res) => {
  const filename = req.params.filename;
  const file = bucket.file(filename);

  try {
    const signedUrl = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });
    
    res.json({ url: signedUrl[0] });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});