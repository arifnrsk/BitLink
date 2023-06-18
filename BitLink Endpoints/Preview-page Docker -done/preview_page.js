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

// EJS sebagai template engine
app.set('view engine', 'ejs');

// Enable CORS for all routes
app.use(cors());

app.get('/preview/:username', async (req, res) => {
    // Mengakses username dari rute
    const username = req.params.username;

    // Mengambil semua data pengguna dari Firebase Realtime Database
    const db = admin.database();
    const ref = db.ref('users');
    ref.once('value', (snapshot) => {
        const usersData = snapshot.val();

        // Mencari pengguna dengan username yang sesuai
        let userData;
        for (let uid in usersData) {
            if (usersData[uid].username === username) {
                userData = usersData[uid];
                break;
            }
        }

        // Memastikan pengguna ada dalam database
        if (!userData) {
            res.status(404).render('404');
            return;
        }

        // Menyiapkan data untuk halaman preview
        const previewData = {
            avatarpage: userData.avatarPage,
            pageTitle: userData.pageTitle,
            links: userData.links,
        };

        // Mengirim data sebagai respons JSON
        res.render('preview', {previewData});
    });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});