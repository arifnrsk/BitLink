import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

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
const db = getDatabase(app);

// Fungsi untuk menambahkan efek shake pada validasi
function addShakeEffect(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500); // Set time delay to 500ms to ensure effect duration
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

function showMessageError(message) {
    var messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    
    // Menghapus class .show setelah beberapa detik
    setTimeout(function() {
        messageElement.classList.remove('show');
    }, 4000);
}
// ----

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Avatar Section
        // Ambil avatar URL dari Firebase Realtime Database
        const avatarRef = ref(db, 'users/' + user.uid + '/avatar');
        const defaultAvatar = "https://storage.googleapis.com/bitlink-image-source/Blank%20avatar.png?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=Tm%2FHseKGdBRdg%2BMud29tQlbxdunHsfdlEDgRde7eA23wGNdm%2Fo%2BpsTj%2FU7co3bcp1xrikdFMzsfJ764lPbDcJF7CjW0f35jdkHguxmWDLtTFLYF07cRAYzpOnzrk9M0zEqQlbIBTNM7PlEvIBd68ojwLxBugKawBQTmhNKhbAb2vWhF3kFN71rlhygeZ5QvHkiHc3n0DssGdf6Uhkq44sJqxH8Lmq677cI%2F4EoOxFudthJ%2FvTywpI2py9heMAvqOa0zlQyLOEGpRPDPQYi0aqV0w1Tt6U5MPeQIWvO99NwaR6DXh5Nq8AT1UjXjg99jNfga6e%2BZqqIZSqnTnO%2FSouw%3D%3D";
        onValue(avatarRef, (snapshot) => {
            const avatarURL = snapshot.val();
            const avatarImage = document.getElementById('avatar-image');
            if (!avatarURL) {
                avatarImage.onload = function() {
                    hideLoadingScreen();
                };
                avatarImage.src = defaultAvatar;
            } else {
                avatarImage.onload = function() {
                    hideLoadingScreen();
                };
                avatarImage.src = avatarURL + '&timestamp=' + new Date().getTime();

            }
        });
        // ----

        // Event listener untuk pemilihan file avatar
        const avatarInput = document.getElementById("avatar-input");
        const avatarContainer = document.getElementById("avatar-container");

        avatarContainer.addEventListener("click", () => {
            avatarInput.click();
        });
        avatarInput.addEventListener("change", (event) => {
            const file = event.target.files[0];

            // Validasi file gambar
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(file.type)) {
                showMessageError("Please use jpeg/jpg/png format.");
                return;
            }
            // ----

            // Mengunggah file avatar ke backend Python
            showMessage("Uploading...");
            uploadAvatarToBackend(file);
            // ----
        });
        // ----
        // End section avatar

        // Username section
        // Mengambil current username dari Firebase Realtime Database
        const usernameRef = ref(db, 'users/' + user.uid + '/username');
        onValue(usernameRef, (snapshot) => {
            const currentUsername = snapshot.val();
            if (currentUsername) {
                const usernameInput = document.getElementById('username');
                usernameInput.value = currentUsername;
            }
        });

        // Event listener untuk menyimpan perubahan username
        const saveButton = document.getElementById('save');
        saveButton.addEventListener('click', (event) => {
            event.preventDefault();
            const newUsername = document.getElementById('username').value;
            
            // Validasi username
            if (newUsername.trim() === '') {
                validationMessage.textContent = "Username cannot be empty.";
                addShakeEffect(validationMessage);
                return;
            }
            // ----

            // Membuat data yang akan dikirim ke backend
            const data = {
                username: newUsername
            };

            user.getIdToken(true).then((token) => {
                // Use the refreshed token
                sessionStorage.setItem('token', token);
            
                // Mengirim permintaan POST menggunakan endpoint
                fetch("https://update-username-luylauepla-et.a.run.app/update_username", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "Authorization": "Bearer " + token
                  },
                  body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    location.reload();
                })
                .catch(error => {
                    console.error(error);
                    showMessage("Error while updating username: " + error);
                    hideLoadingScreen();
                });
            });
        });
        // ----
        // End section username
    } else {
        // Jika user tidak sedang login, tampilkan pesan
        showMessage("User is not currently logged in.");
    }
});

// Fungsi upload avatar
function uploadAvatarToBackend(file) {
    const user = auth.currentUser;
    const formData = new FormData();
    formData.append("avatar", file);
    
    // Refresh user token
    user.getIdToken(true).then((token) => {
        sessionStorage.setItem('token', token);

        // Fetching upload avatar dengan endpoint
        fetch("https://upload-avatar-luylauepla-et.a.run.app/upload_avatar", {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + token 
            },
            body: formData,
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            // Avatar berhasil diunggah
            location.reload();
            hideLoadingScreen();
        })
        .catch((error) => {
            console.log(error);
            showMessage("Error while uploading avatar: " + error);
            hideLoadingScreen();
        });
    });
    // ----
}
// ----

// Event listener untuk mengirim permintaan reset password
const resetPasswordSubmit = document.getElementById('resetPasswordSubmit');
const resetPasswordEmail = document.getElementById('resetPasswordEmail');
const resetPasswordValidationMessage = document.getElementById('resetPasswordValidationMessage');

// Event listener untuk open form reset password
const resetPasswordLink = document.getElementById('resetPasswordLink');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const blurBackground = document.getElementById('blurBackground');

resetPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();
    resetPasswordForm.style.display = 'flex';
    blurBackground.style.display = 'block';
});
// ----

// Event listener untuk close form reset password
const closeResetPasswordForm = document.getElementById('closeResetPasswordForm');

closeResetPasswordForm.addEventListener('click', (event) => {
    event.preventDefault();
    resetPasswordForm.style.display = 'none';
    blurBackground.style.display = 'none';
});
// ----

resetPasswordSubmit.addEventListener('click', () => {
    const email = resetPasswordEmail.value;
    
    // Validasi email
    if (email.trim() === '') {
        resetPasswordValidationMessage.textContent = "Email cannot be empty.";
        addShakeEffect(resetPasswordValidationMessage);
        return;
    }
    // ---

    // Validasi format email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
        resetPasswordValidationMessage.textContent = "Email is not valid!";
        addShakeEffect(resetPasswordValidationMessage);
        return;
    }
    // ----

    // Membuat data yang akan dikirim ke backend
    const data = {
        email: email
    };
    // ----
    
    // Memvalidasi email dengan endpoint
    fetch("https://validate-email-luylauepla-et.a.run.app/validate_email", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.message == "Email not registered!") {
            throw new Error("Email not registered!");
        }
        // Kirim permintaan reset password ke Firebase jika email terdaftar
        return sendPasswordResetEmail(auth, email);
    })
    .then(function() {
        resetPasswordValidationMessage.textContent = "Password reset email sent to " + email;
        resetPasswordValidationMessage.style.color = "#000000";
        addShakeEffect(resetPasswordValidationMessage);
        resetPasswordForm.style.display = 'none';
        blurBackground.style.display = 'none';
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(error);
        resetPasswordValidationMessage.textContent = "Error while resetting password: " + errorMessage;
        addShakeEffect(resetPasswordValidationMessage);
    });
    // ----
});
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