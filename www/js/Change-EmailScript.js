import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

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

// Toggle password
var togglePasswordButton = document.getElementById("togglePassword");

togglePasswordButton.addEventListener('click', function() {
    var passwordField = document.getElementById("reauthPassword");
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
});
// ----

// Fungsi untuk menambahkan efek shake pada validasi
function addShakeEffect(element) {
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 500); // Set time delay to 500ms to ensure effect duration
}

let validationMessage = document.getElementById('validationMessage');
let reauthValidationMessage = document.getElementById('reauthValidationMessage');
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

// Handle user email
let user;

onAuthStateChanged(auth, firebaseUser => {
    if (firebaseUser) {
        user = firebaseUser;
    } 
    if (user) {
        document.getElementById('emailBefore').textContent = user.email;
    }
    hideLoadingScreen()
});
// ----

// Event listeners 
document.getElementById('closeReauthForm').addEventListener('click', function(e) {
    e.preventDefault();
    hideReauthForm();
}); // Untuk tombol tutup pada form reauth

document.getElementById('reauthSubmit').addEventListener('click', handleEditProfileForm); // Untuk submit event listener

// Menambahkan event listener untuk tombol save
document.getElementById('save').addEventListener('click', handleSaveClick); // Untuk tombol save

document.getElementById('reauthSubmit').addEventListener('click', handleReauthSubmit); // Untuk handle reauthentication pada submit
// ----

// Functions
function showReauthForm() {
    reauthForm.style.display = 'flex';
    blurBackground.style.display = 'block';
}

function hideReauthForm() {
    reauthForm.style.display = 'none';
    blurBackground.style.display = 'none';
}

function handleSaveClick(e) {
    e.preventDefault();
    const emailAfterValue = emailAfter.value;

    // Validasi field kosong
    if (!emailAfterValue) {
        validationMessage.textContent = "Please enter the new email";
        addShakeEffect(validationMessage);
        return;
    }
    // ----

    // Validasi format email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(emailAfterValue);
    if (!isValid) {
        validationMessage.textContent = "Email is not valid!";
        addShakeEffect(validationMessage);
        return;
    }
    // ----

    // Validasi apakah email sudah terdaftar, dengan memanggil endpoint
    fetch("https://validate-email-luylauepla-et.a.run.app/validate_email", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: emailAfterValue
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Email already registered!") {
            validationMessage.textContent = "Email is already registered!";
            addShakeEffect(validationMessage);
        } else {
            // Email is not registered, show the reauth form
            showReauthForm();
        }
    })
    .catch((error) => {
        validationMessage.textContent = "Error in validating email: " + error.message;
        addShakeEffect(validationMessage);
    });
    // ----
}

function handleReauthSubmit(e) {
    e.preventDefault();

    const reauthPasswordValue = reauthPassword.value;

    // Create credentials
    const credentials = EmailAuthProvider.credential(
        user.email,
        reauthPasswordValue
    );
    // ----

    // Reauthenticate the user
    reauthenticateWithCredential(user, credentials)
        .then(() => {
            // User re-authenticated.
            reauthValidationMessage.textContent = "Re-authentication successful!";
            addShakeEffect(reauthValidationMessage);
            reauthValidationMessage.style.color = "#15ff00cc";
            handleEditProfileForm(e); // call handleEditProfileForm function after successful reauthentication
            hideLoadingScreen()
        })
        .catch((error) => {
            // console.error('Error in re-authentication:', error);
            reauthValidationMessage.textContent = "Re-authentication failed. Please check your password and try again.";
            addShakeEffect(reauthValidationMessage);
            reauthValidationMessage.style.color = "#FF0000";
            hideLoadingScreen()
        });
    // ----
}

function handleEditProfileForm(e) {
    e.stopPropagation();

    const emailAfterValue = emailAfter.value;
    const password = reauthPassword.value;

    const credential = EmailAuthProvider.credential(user.email, password);

    reauthenticateWithCredential(user, credential).then(function() {
        // User telah melakukan re-authenticated, updateEmail bisa dipanggil
        updateEmail(user, emailAfterValue)
          .then(() => {
              hideReauthForm();
              hideLoadingScreen()
              window.location.href = "./Profile.html";
          })
          .catch((error) => {
              console.error('Error updating email:', error);
              reauthValidationMessage.textContent = "Failed to update email. Please try again.";
              addShakeEffect(reauthValidationMessage);
              reauthValidationMessage.style.color = "#FF0000";
              hideLoadingScreen()
          });
        // ----
    }).catch(function(error) {
        console.error('Error in re-authentication:', error);
        reauthValidationMessage.textContent = "Re-authentication failed. Please check your password and try again.";
        addShakeEffect(reauthValidationMessage);
        reauthValidationMessage.style.color = "#FF0000";
        hideLoadingScreen()
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