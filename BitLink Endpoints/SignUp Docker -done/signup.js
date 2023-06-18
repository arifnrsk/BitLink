const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Load credentials dari service account file dan load firebase storage
const serviceAccount = require('./bitlink-project-firebase-adminsdk-j7592-3e135fe490.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app/',
    storageBucket: 'bitlinkprojectv2'
});

const db = admin.database();
const app = express();
app.use(cors());
app.use(express.json());

// Signup function
app.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;

    // Check if the username already exists
    const usernameLowercase = username.toLowerCase();
    const usernameRef = db.ref('users').orderByChild('lowercaseUsername').equalTo(usernameLowercase);
    const snapshot = await usernameRef.once('value');
    if (snapshot.exists()) {
        return res.status(400).send({ message: 'Username already taken!' });
    }

    // Try to create a new user account
    try {
        const user = await admin.auth().createUser({
            email,
            password
        });

        // Save the username in the Realtime Database
        const ref = admin.database().ref('users'); // Use the 'users' collection
        await ref.child(user.uid).set({
            'username': username,
            'lowercaseUsername': username.toLowerCase(),
        });

        res.status(201).send({ message: 'User created successfully!', uid: user.uid });

    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            res.status(400).send({ message: 'Email already registered!' });
        } else {
            res.status(400).send({ message: error.message });
        }
    }
});

app.get('/', (req, res) => {
    res.send('Hello, this is your server. Use /signup to create a new user.');
});

// Menjalankan server di port 8080
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
