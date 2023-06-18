import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBXGgAyrNH3vKtVida_bZVis-71zfuT0zQ",
    authDomain: "bitlink-project.firebaseapp.com",
    databaseURL: "https://bitlink-project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bitlink-project",
    storageBucket: "bitlink-project.appspot.com",
    messagingSenderId: "1011590190992",
    appId: "1:1011590190992:web:953ecd19528e492a4e8515",
    measurementId: "G-QXTNY8GFKT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Fungsi untuk menambahkan efek shake pada validationMessage
function addShakeEffect() {
    let validationMessage = document.getElementById('validationMessage');
    validationMessage.classList.add('shake');
    setTimeout(() => validationMessage.classList.remove('shake'), 150);
}

let validationMessage = document.getElementById('validationMessage');
// ----

// Fungsi loading screen
let showMessageInterval;

function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';

    // Mengatur timeout berdasarkan koneksi internet
    const connectionSpeed = navigator.connection ? navigator.connection.downlink : 1;

    const timeoutDuration = Math.ceil(connectionSpeed * 1000); 

    showMessageInterval = setInterval(() => {
        showMessage('Connection timeout!');
        setTimeout(() => {
            showMessage('Please refresh the page.');
        }, 1000); // Menunggu 1 detik sebelum menampilkan pesan berikutnya
    }, timeoutDuration + 1000);
    // ----
}

function hideLoadingScreen() {
    clearInterval(showMessageInterval);
    document.getElementById('loadingScreen').style.display = 'none';
}

showLoadingScreen();
// ----

// Fungsi untuk menampilkan pesan
function showMessage(message) {
    var messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    
    // Menghapus class .show setelah beberapa detik
    setTimeout(function() {
        messageElement.classList.remove('show');
    }, 1000); // 1000 ms = 1 detik
}
// ----

// Event listener untuk menampilkan data pengguna
document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const avatarImage = document.getElementById("avatar-image");
            const usernameLabel = document.getElementById("username");
            const emailLabel = document.getElementById("email");
            const defaultAvatar = "https://storage.googleapis.com/bitlink-image-source/Profile%20button.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=DphMjr%2BCf%2FvdUXXTnJrLdaznWK1AT5Kn8kHmKraTsxH3fV%2F1jTM6WV1J%2F9nGQ08RK2IIkWa9fS3WiBxqQaR7miTPbvTb3IynTJqBuBFO0eHOrleKwdgDP9wGsc55RrZdmpo8tfTmlDRd7FMf4QyzSpD7cGUxwwkocR1D7tuKv3RhGL%2B%2F8suP%2F41tHClBui%2F2NHtSSUgT8svjkul1odq4AU4D%2BbJZ65Ww9RtniyMsdISbwuuM6iKnPNwuE1DAUddXsFOmQ34AkU09E46wWnaTIACOS0Ma%2FojpCKC0YgQ6Mvz%2F%2BPmGI6l6xF%2FbeCKpQuh6KYUiBlW6B116rSLrXd9OAA%3D%3D";
    
            // Mengambil data user dari Firebase Realtime Database
            const db = getDatabase();
            const userRef = ref(db, 'users/' + user.uid);
            onValue(userRef, (snapshot) => {
                const data = snapshot.val();
                const avatar = data.avatar;  // URL avatar pengguna
                const username = data.username;  // Username user
    
                // Menampilkan data pengguna di halaman profil
                avatarImage.onload = function() {
                    hideLoadingScreen();
                };
                if (!avatar) {
                    avatarImage.src = defaultAvatar;
                } else {
                    avatarImage.src = avatar + '&timestamp=' + new Date().getTime();
                }
                usernameLabel.textContent = username;
                emailLabel.textContent = user.email;  // Email tetap diambil dari objek 'user'
            });
        } else {
            // User logout
            window.location.href = "./index.html";
        }
    });
});
// ----

// Function untuk logout
window.signOut = function() {
    getAuth().signOut().then(function() {
        // Sign-out sukses
        sessionStorage.removeItem('token');  // Hapus token
        window.location.href = "./index.html";
    }).catch(function(error) {
        // An error happened.
        validationMessage.textContent = "Sign Out Error" + error;
        addShakeEffect();
    });
}
// ----

// Refresh pulldown
let startY = 0; // Posisi awal
let pullDown = false; // Apakah user sedang menarik ke bawah

window.addEventListener('touchstart', (event) => {
    startY = event.touches[0].pageY;
});

window.addEventListener('touchmove', (event) => {
    const distance = event.touches[0].pageY - startY;
    
    if (distance > 100) {
        document.getElementById('refresh-icon').classList.add('pulled');
        pullDown = true;
    } else {
        document.getElementById('refresh-icon').classList.remove('pulled');
        pullDown = false;
    }
});

window.addEventListener('touchend', (event) => {
    if (pullDown) {
        // User telah menarik ke bawah, lakukan refresh halaman
        location.reload();
    }
});
// ----