import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
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

// Cek apakah user telah login sebelumnya atau tidak
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User telah login, redirect ke Link.html
        hideLoadingScreen();
        window.location.href = "./Link.html";
    }
    hideLoadingScreen();
});
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

// Toggle password
var togglePasswordButton = document.getElementById("togglePassword");

togglePasswordButton.addEventListener('click', function() {
    var passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
});
// ----

// Fungsi untuk menambahkan efek shake pada validationMessage
function addShakeEffect() {
    let validationMessage = document.getElementById('validationMessage');
    validationMessage.classList.add('shake');
    setTimeout(() => validationMessage.classList.remove('shake'), 150);
}
// ----

// Validasi login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let validationMessage = document.getElementById('validationMessage');

    // Email validation
    if (email === '') {
        validationMessage.textContent = "Email field cannot be empty!";
        addShakeEffect();
      return;
    }
    // ----

    // Password validation
    if (password === '') {
        validationMessage.textContent = "Password field cannot be empty!";
        addShakeEffect();
        return;
    }
    // ----

    // Firebase's signInWithEmailAndPassword untuk verifikasi password
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // User berhasil login
        const user = userCredential.user;
        user.getIdToken().then(function(token) {
            // Token untuk autentikasi permintaan ke server
            sessionStorage.setItem('token', token);
        });
        window.location.href = "./Link.html";
        // ----
    })
    .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        if (errorMessage == "Firebase: Error (auth/user-not-found).") {
            validationMessage.textContent = "Email is not registered!";
            addShakeEffect();
        } else {
            validationMessage.textContent = "Wrong password!";
            addShakeEffect();
        }
    });
    // ----
});
// ----

// Transisi
function addSlideEffect() {
  var signupPage = document.getElementById("loginPage");
  signupPage.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
      addSlideEffect();
  }, 1000); // Delay
});
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
    
    // Memvalidasi email dengan memanggil endpoint
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