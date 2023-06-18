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
    }, 1000); // 2000 ms = 2 detik
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

// Load avatar
function displayAvatarPage(user) {
    const avatarImage = document.getElementById("avatar-image");
    const defaultAvatar = "https://storage.googleapis.com/bitlink-image-source/fi-br-upload.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=LbA8xeOaLGwEXzXFT21FZNSV5KSrgLFf9hHXRypt8hSZzGr%2BIkJxVE38c4u4JR73smYKRg0Q0q2vYFSzdareeS%2BRWkauss21MPLcogYqCVumIB9%2FKCCqBxfiWSmlMNZRXfONKbtLh9ddXmhCXVGMH5eGp%2FN5qeARiriR%2FB%2FuMEdmKJy6Cd7%2F3a4DnKip6r%2F4%2FwyyP3VVOmVsQl5e%2FOznLCH9xIsMry8wsFsqQ57WrqMZ2CjpnWxhh6YRnBsjS4YwF%2FjHNmRt4py9Q8kMG6XuvtXg4Xb7lF1Rrig7vs0m%2FgPpZgI9BHOg112adX%2Btc8U507PkZ8%2Bf209OJjAbCqioSA%3D%3D";
  
    // Mengambil data user dari Firebase Realtime Database
    const db = getDatabase();
    const userRef = ref(db, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        const avatar = data.avatarPage;  // URL avatar pengguna

        // Jika value avatar null atau undefined, gunakan default avatar
        if (!avatar) {
            avatarImage.src = defaultAvatar;
        } else {
            // Menampilkan data pengguna di halaman profil
            avatarImage.src = avatar + '&timestamp=' + new Date().getTime();
        }
    });
}
// ----

// Fungsi upload avatar dan thumbnail
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

function uploadThumbnailOnAdd(file, fieldName) {
    const user = auth.currentUser;
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Refresh token
    return user.getIdToken(true).then((token) => {
        sessionStorage.setItem('token', token);

        // Fetching upload thumnbnail dengan endpoint
        return fetch("https://upload-thumbnail-luylauepla-et.a.run.app/upload_thumbnail", {
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
            // Thumbnail berhasil diunggah
            return data.thumbnail_url; // Return thumbnail URL
        })
        .catch((error) => {
            validationMessage.textContent = "Error while uploading thumbnail: " + error;
            addShakeEffect(validationMessage);
            hideLoadingScreen();
        });
    });
}

function uploadThumbnailToBackend(file, fieldName, linkUid) {
    const user = auth.currentUser;
    const formData = new FormData();
    formData.append(fieldName, file);
    formData.append('link_uid', linkUid);
    
    user.getIdToken(true).then((token) => {
        // Use the refreshed token
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
// ----

// Fungsi untuk menambahkan link ke server
async function addLink(title, link, thumbnail_url) {
    let idToken = await auth.currentUser.getIdToken(true);

    // Add link dengan endpoint
    let response = await fetch(`https://add-link-luylauepla-et.a.run.app/add_link`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, link, thumbnail_url })
    });

    if (!response.ok) {
        console.error(`Response status: ${response.status}, status text: ${response.statusText}`);
        throw new Error('Error during link addition');
    }

    return await response.json();
}
// ----

// Fungsi mengambil data links dan display
async function getLinks() {
    let idToken = await auth.currentUser.getIdToken(true);

    // Fetching data links dengan endpoint
    let response = await fetch(`https://get-links-luylauepla-et.a.run.app/get_links`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${idToken}`
        }
    });

    if (!response.ok) {
        throw new Error('HTTP error! status: ${response.status}');
    }
    let data = await response.json();
    // Convert object menjadi array
    let links = [];
    if (data) {
        for (let uid in data) {
            let link = data[uid];
            link.uid = uid;  // Set the uid property of the link
            links.push(link);
        }
    }
    return links;
}

function displayLinks(links, user) {
    const db = getDatabase();
    let container = document.querySelector('.link-container');
    container.innerHTML = ''; // clear container

    for (let link of links) {
        let div = document.createElement('div');
        div.classList.add('link-div');
    
        // Pembuatan element html untuk thumbnail
        let img = document.createElement('img');
        let url = new URL(link.thumbnail_url);
        if (url.search) {
            url.searchParams.append('timestamp', new Date().getTime()); // Jika url thumbnail memiliki query paramaters, maka add timestamp sebagai additional parameter
        } else {
            url.search = '?timestamp=' + new Date().getTime(); // Jika tidak memiliki, maka add timestamp sebagai first parameter
        }
        img.src = url.toString();
        img.alt = link.title;
        img.classList.add('thumbnail-img');
        // ----
    
        // Pembuatan element html untuk thumbnail input
        let thumbnailInput = document.createElement('input');
        thumbnailInput.type = 'file';
        thumbnailInput.classList.add('thumbnail-input');
        thumbnailInput.style.display = 'none';
        // ----
    
        // Pembuatan element html button untuk trash
        let trashButton = document.createElement('button');
        let trashImage = document.createElement('img');
        trashImage.src = "./img/fi-br-trash.svg";
        trashImage.classList.add('trashImage');
        trashButton.appendChild(trashImage);
        // ----

        // Event listener untuk trash button
        trashButton.addEventListener('click', function(event) {
            event.preventDefault();
            deleteLink(user, link.uid);
            showMessage("Link deleted");
        });
        // ----
    
        // Pembuatan new div untuk wrap thumbnail and trash button
        let divThumbnail = document.createElement('div');
        divThumbnail.classList.add('divThumbnail');
        divThumbnail.appendChild(thumbnailInput);
        divThumbnail.appendChild(img);
        divThumbnail.appendChild(trashButton);
        
        div.appendChild(divThumbnail);
        // ----

        // Event listener untuk thumbnail input
        img.addEventListener('click', function(event) {
            event.preventDefault();
            thumbnailInput.click();
        });
        thumbnailInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
    
            // Validasi image file
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(file.type)) {
                validationMessage.textContent = "The file is not an image. Please select an image file.";
                addShakeEffect(validationMessage);
                return;
            }
            
            showMessage("Uploading...");
            uploadThumbnailToBackend(file, "thumbnail_url", link.uid)
        });
        // ----
    
        // Pembuatan element html untuk input
        let inputDiv = document.createElement('div');
        inputDiv.classList.add('input-div');
        // ----
    
        // Pembuatan element html untuk title
        let titleInput = document.createElement('input');
        titleInput.value = link.title;
        titleInput.addEventListener('change', function(event) {
            const newTitle = event.target.value;
            const titleRef = ref(db, 'users/' + user.uid + '/links/' + link.uid + '/title');
            set(titleRef, newTitle).catch((error) => {
                showMessage("Error updating title: " + error);
            });
            showMessage("Title updated successfully");
        });
        inputDiv.appendChild(titleInput);
        // ----
    
        // Pembuatan element html untuk link
        let linkInput = document.createElement('input');
        linkInput.value = link.link;
        linkInput.addEventListener('change', function(event) {
            const newLink = event.target.value;
            
            if (!newLink.startsWith("http://") && !newLink.startsWith("https://")) {
                showMessageError("Please add 'http://' or 'https://' at the beginning of the link.");
                return;
            } // Pengecekan jika link starts with http:// atau https://
            const linkRef = ref(db, 'users/' + user.uid + '/links/' + link.uid + '/link');
            set(linkRef, newLink)
                .then(() => {
                    showMessage("Link updated successfully");
                })
                .catch((error) => {
                    showMessage("Error updating link: " + error);
                });
        });
        inputDiv.appendChild(linkInput);
        div.appendChild(inputDiv);
    
        // Append div ke container
        container.appendChild(div);
    }
    hideLoadingScreen();
}
// ----

// Fungsi delete 
function deleteLink(user, linkUid) {
    const db = getDatabase();

    const linkRef = ref(db, 'users/' + user.uid + '/links/' + linkUid);
    remove(linkRef)
    .then(() => {
        location.reload();
    })
    .catch((error) => {
        console.error("Error removing link: ", error);
    });
}
// ----

// Main
document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            displayAvatarPage(user)
            
            let links = await getLinks();
            displayLinks(links, user);

            // Edit title page
            const titleLabel = document.getElementById("title-label");
        
            const db = getDatabase();
            const userRef = ref(db, 'users/' + user.uid + '/pageTitle');
            onValue(userRef, (snapshot) => {
                const data = snapshot.val();
                titleLabel.value = data || "Click to edit the Title.";
            });
        
            // Event listener untuk perubahan di input titleLabel
            titleLabel.addEventListener('change', function() {
                const newTitle = titleLabel.value;
        
                const pageTitleRef = ref(db, 'users/' + user.uid + '/pageTitle');
                set(pageTitleRef, newTitle).catch((error) => {
                    showMessage("Error updating pageTitle: " + error);
                });
                showMessage("Page Title updated successfully");
            });
            // ----

        } else {
            // Jika user logout
            window.location.href = "./index.html";
        }
    });
});
// ----

// Event listener untuk menampilkan dan menyembunyikan popup form saat Add button ditekan
document.getElementById("addButton").addEventListener("click", function() {
    this.classList.add('rotate');
    setTimeout(() => this.classList.remove('rotate'), 400);
    document.getElementById("popup-form").style.display = "block";
});

document.getElementById("close-button").addEventListener("click", function() {
    document.getElementById("popup-form").style.display = "none";
});
// ----

// Menampilkan nama file thumbnail pada upload button
document.getElementById('thumbnail').addEventListener('change', function() {
    let fileName = this.files[0].name;
    document.getElementById('upload-button').textContent = fileName;
});
// ----

// Menambahkan listener ke tombol upload thumbnail dan tambah link
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault();

    let title = document.getElementById('title').value;
    let link = document.getElementById('link').value;

    if (!title || !link) {
        validationMessage.textContent = "Title and Link fields cannot be empty.";
        addShakeEffect(validationMessage);
        return;
    }

    if (!link.startsWith("http://") && !link.startsWith("https://")) {
        validationMessage.textContent = "Please add 'http://' or 'https://' at the beginning of the link.";
        addShakeEffect(validationMessage);
        return;
    }

    try {
        let thumbnailFile = document.getElementById('thumbnail').files[0];
        let thumbnail_url;
        if (thumbnailFile) {
            thumbnail_url = await uploadThumbnailOnAdd(thumbnailFile, "thumbnail");
        } else {
            thumbnail_url = 'https://storage.googleapis.com/bitlink-image-source/ThumbnailDefault.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=CbUn4IwzLg3tcVhU91vPasQdq0nzOJGKJM1h1JKjNefowBdTbtfwmPxROtLYXM%2B4f0IlwSZmCz4LERYRdHQh3T8ywydqKbgJmV4zQmnBv092KKnR7lWaJxXpt36BESK4Ay%2FweP5RD9A%2B8NXbKAj9YaKSiiUIIr9bB2q81t%2BMtuC4nbm78iOGLe8Ua%2F%2FCDdm5QtD%2F8NrfXLjuFsG9PXj9hY81lEE7sqCLh8A%2FQ8kf5RbNh8m8Cg7Y9rtpEa9XmAqm3Gdh85uy1YdEBxmjmqh6%2B55K8aA3%2F03RiTCaN%2Fp3RYmj5AG7TRMEqXJMaTmhRx47NQMlerALHxgcd4lglvl%2FLw%3D%3D';
        }

        await addLink(title, link, thumbnail_url);
        showMessage("Link added successfully");
        
        // Tutup form setelah berhasil
        document.getElementById('popup-form').style.display = 'none';
        location.reload();
    } catch (err) {
        console.error(err);
        validationMessage.textContent = "Error: " + err;
        addShakeEffect(validationMessage);
    }
});

document.getElementById('upload-button').addEventListener('click', () => {
    document.getElementById('thumbnail').click();
});
// ----

// Animasi profile navbar button
window.onload = function() {
    // Mendapatkan URL halaman saat ini
    let currentUrl = window.location.href;
    
    if (currentUrl.endsWith('/Link.html')) {
        document.getElementById('linkIcon').src = 'https://storage.googleapis.com/bitlink-image-source/Link.%20icon%20After.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=VkR6Qkff9h4vZ6tkWU10LE1itG4x%2F3eAkxeOLYnWgC8twbHStXOZCgek0wWJU0mz%2FNSvGjONod2mNnZYRiSYiH8SBKEfnTH0o2axoUvAzver9MPDEG64O0MTMQ41MEYaDRJqcpJEJCyPOhfIAL2HPwvPeKBjcwqgBdGTcOf3BtocXEpKZQ0ekcpNKxKH%2FAqhIjmytmMOnI5hz4Fh8xVpj485rPOZMZV5wayKlPO0Gpc7OyapoibKb1YfF1dvPm6EnW6risQ2S4YoMJFn2Pdt5%2BI%2FiXznovoETe1gQ2UQXCPjZmBFhZUlKtX5P3%2Flfznrska1bdMOSgc4ERW7G%2BR7Ng%3D%3D';
    } else if (currentUrl.endsWith('/Short.html')) {
        document.getElementById('shortIcon').src = 'https://storage.googleapis.com/bitlink-image-source/Short.%20icon%20After.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=d7q79f9%2BABqpjCenAjNFAqGU%2BEFuNT0mWMOmltaFz51R9%2BQHXatMFVxuePNFas9uMRtCL21BJkWAaMWhYn372RP2pBVAOwKxjVtnHWrNMRJXhlcsC4CdxhTAWw1%2BQv%2BB%2BXCZI%2FwBjgioevGcgZDg%2BaoaxTA2b2yGCisGdDkNuAlXVDQsHNGVpvbgpc%2Fd3t9ARIsGR2NbMZDgRt5TENW%2BwuaOLOmx7dFrUlDt3GZsQL5SbM%2F5ahz9jXCWCt%2FAfdq1xBp9mthTfVyNfeQTS7tSkMLL4FpVkZ5avuRxUaTMlRWbpLVtJAg4CCr0KLlr8WE2%2BiFapXXekiVWInVUPKfKBQ%3D%3D';
    } else if (currentUrl.endsWith('/Preview.html')) {
        document.getElementById('previewIcon').src = 'https://storage.googleapis.com/bitlink-image-source/Preview.%20icon%20After.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=KI%2Bpp3BJ8SdC%2BCUZgLcIbc2qlL0IIUuEacbybFTeiLd3NwyqfiFcayKDoQFXFFbsvTlAMoPV3ScNnmB77p8CeLubsFCSkkffozlh%2BdXvBTVYvF9zz8a8oB9ts8ajcM0ZQSpejCHOY47rXQT%2FNQGyMcU6YEKAwEnQUcv76xLzIZdVGY5mnFAEaolVqiJj1fuTUnpvP0g75ZNKOZnAYCCH4BXuhEIFNT8VGMMIN3WP8g7m41UghT5MUqIQfVvBH%2Bow2Eu71Dx%2BLqFWV44q62pUlgGqfm977olHrxRv3eDthhVcb9OC1WXkFl%2FQfTvyFi2PoliEjPpB07JR9gI5LQyyoQ%3D%3D';
    }
};

const profileButton = document.getElementById('profileButton');
const profileAvatar = document.getElementById('profileAvatar');

profileButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    profileAvatar.classList.add('fadeout');
    
    setTimeout(function() {
        profileAvatar.src = 'https://storage.googleapis.com/bitlink-image-source/Profile.%20icon%20after.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=Y3TWhnMv1gDvJtMOv0UjBFlTW9WQZkyRqj8yL%2Bf9DellqlTNUDLh0mgEEWUjGNT3tO2hYQFXc%2FRxO7hvp1az9%2FDjAH2Y30vdqRd7N8MPrNB1kerliF41Mt%2BXEY5wJaDM4JDalHxCzjIH3FEKyi6NNxj1rO3Ku%2BZcElfkO6UrmklT5%2Bp8pcDxA%2BsvjmgzQoqTjk9vFyefIBjCcPuJjwFdd1zpXuaP7Opf34aBGobebJYIrOOIvIO1sX9IrBY0TIhhClSZI7rmEtccoaENcaa0XTNlCL%2FPu8K%2FkhebFiA0V7BsaKg3nuujlsNRKRdUJZmtDZsriIDI9OvOOpQVP7xPgQ%3D%3D';
        profileAvatar.classList.remove('fadeout');
        profileAvatar.classList.add('fadein');
    }, 100); // Mengubah source image setelah animasi 'fade out' selesai
    
    setTimeout(function() {
        profileAvatar.classList.remove('fadein');
        window.location.href = "./Profile.html";
    }, 1000); // Menghapus kelas 'fadein' setelah animasi selesai

});
// ----

// Search
$(document).ready(function(){
    $('#search-input').on('keyup', function(){
        var searchValue = $(this).val().toLowerCase();

        // Menghapus kelas blink dari semua elemen sebelum melakukan pencarian baru
        $('.link-div').removeClass("blink");

        if (searchValue !== "") {
            $('.link-div').each(function(){
                var inputValue = $(this).find('.input-div input').val().toLowerCase();
                var regex = new RegExp(searchValue);
                if (regex.test(inputValue)) {
                    //Scroll ke elemen dan ubah warna latar belakang
                    var topPos = $(this).offset().top - 300; // -300 untuk memberi ruang di atas elemen
                    if($(window).scrollTop() !== topPos){
                        $('html, body').animate({
                            scrollTop: topPos
                        }, 500);
                    }
                    $(this).addClass("blink"); // Menambahkan kelas blink
                }
            });
        }
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