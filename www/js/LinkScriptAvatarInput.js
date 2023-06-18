import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getDatabase, ref, onValue , set, remove} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

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

function uploadImageToBackend(file, fieldName) {
    const user = auth.currentUser;
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Refresh token
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
            validationMessage.textContent = "Error while uploading avatar: " + error;
            addShakeEffect(validationMessage);
            hideLoadingScreen();
        });
    });
}

// Event listener untuk pemilihan file avatar
const avatarInput = document.getElementById("avatar-input");
const avatarContainer = document.getElementById("avatar-container");

avatarContainer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    avatarInput.click();
    });
    avatarInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        // Validasi file gambar
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            validationMessage.textContent = "The file is not an image. Please select an image file.";
            addShakeEffect(validationMessage);
        return;
        }
        // ----

    showMessage("Uploading...");
    uploadImageToBackend(file, "avatarPage");
    // ----
});
// ----

function showMessage(message) {
    var messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    
    // Menghapus class .show setelah beberapa detik
    setTimeout(function() {
        messageElement.classList.remove('show');
    }, 1000); // 2000 ms = 2 detik
}