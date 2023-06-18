import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

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
    setTimeout(function() {
        document.getElementById('loadingScreen').style.display = 'none';
    }, 900);
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

// Function display avata page
function displayAvatarPage(user) {
    const avatarImage = document.getElementById("avatar-image");
    const defaultAvatar = "https://storage.googleapis.com/bitlink-image-source/ThumbnailDefault.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=CbUn4IwzLg3tcVhU91vPasQdq0nzOJGKJM1h1JKjNefowBdTbtfwmPxROtLYXM%2B4f0IlwSZmCz4LERYRdHQh3T8ywydqKbgJmV4zQmnBv092KKnR7lWaJxXpt36BESK4Ay%2FweP5RD9A%2B8NXbKAj9YaKSiiUIIr9bB2q81t%2BMtuC4nbm78iOGLe8Ua%2F%2FCDdm5QtD%2F8NrfXLjuFsG9PXj9hY81lEE7sqCLh8A%2FQ8kf5RbNh8m8Cg7Y9rtpEa9XmAqm3Gdh85uy1YdEBxmjmqh6%2B55K8aA3%2F03RiTCaN%2Fp3RYmj5AG7TRMEqXJMaTmhRx47NQMlerALHxgcd4lglvl%2FLw%3D%3D";
  
    // Mengambil data user dari Firebase Realtime Database
    const db = getDatabase();
    const userRef = ref(db, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        const avatar = data.avatarPage;  // URL avatar pengguna

        // If avatar is null or undefined, use the default avatar
        if (!avatar) {
            avatarImage.src = defaultAvatar;
        } else {
            // Menampilkan data pengguna di halaman profil
            avatarImage.src = avatar + '&timestamp=' + new Date().getTime();
        }
    });
}
// ----

// Function copy button
function setupCopyButton(user) {
    const db = getDatabase();
    const userRef = ref(db, 'users/' + user.uid);

    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const username = userData.username;

                let copyButton = document.getElementById('copyButton');
                copyButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    let fullShortLink = "bitlink.cloud/preview/" + username;
                    navigator.clipboard.writeText(fullShortLink)
                        .then(() => {
                            showMessage("Link page copied to clipboard!");
                        })
                        .catch((err) => {
                            console.warn('navigator.clipboard.writeText not available, falling back to document.execCommand.', err);
                            let textArea = document.createElement("textarea");
                            textArea.style.position = 'fixed';
                            textArea.style.opacity = '0';
                            textArea.style.pointerEvents = 'none';
                            textArea.value = fullShortLink;
                            document.body.appendChild(textArea);
                            textArea.select();

                            try {
                                let successful = document.execCommand('copy');
                                if (successful)
                                showMessage("Link page copied to clipboard!");
                                else
                                    showMessage("Link page failed to copied");
                            } catch (err) {
                                showMessage("Fallback copying failed " + err);
                            }

                            document.body.removeChild(textArea);
                        });
                });
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
}
// ----

// Function untuk mengambil data links
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
    let links = [];
    if (data) {
        for (let uid in data) {
            let link = data[uid];
            link.uid = uid;
            links.push(link);
        }
    }
    return links;
}
// ----

// Function untuk display links
function displayLinks(links, user) {
    let container = document.querySelector('.link-container');
    container.innerHTML = '';

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
    
        div.appendChild(img);
        // ----
        
        // Pembuatan element html untuk link
        let linkAnchor = document.createElement('a');
        linkAnchor.href = link.link;
        linkAnchor.textContent = link.title;
        div.appendChild(linkAnchor);

        container.appendChild(div);
        // ----
    }
    hideLoadingScreen();
}

// Function display title
function displayPageTitle(user) {
    const titleLabel = document.getElementById("title-label");

    const db = getDatabase();
    const userRef = ref(db, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        const title = data.pageTitle;

        // Jika title tidak didefinisikan, gunakan "BitLink Page" sebagai default
        titleLabel.value = title ? title : "BitLink Page";
    });
}
// ----

// Cek sedang melakukan test pada hasil export cordova atau dev chrome
const isCordovaApp = !!window.cordova;

if (isCordovaApp) {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    document.addEventListener('DOMContentLoaded', onDeviceReady, false);
}

function onDeviceReady() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            displayAvatarPage(user);
            displayPageTitle(user);

            let links = await getLinks();
            displayLinks(links, user);

            setupCopyButton(user);
        } else {
            window.location.href = "./index.html";
        }
    });
}
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
    // ----
};

// Event listener untuk mengubah icon avatar ketika di klik
const profileButton = document.getElementById('profileButton');
const profileAvatar = document.getElementById('profileAvatar');

profileButton.addEventListener('click', function(e) {
    e.preventDefault(); // Mencegah perubahan halaman saat link diklik
    
    profileAvatar.classList.add('fadeout');
    
    // Mengubah source image setelah animasi 'fade out' selesai
    setTimeout(function() {
        profileAvatar.src = 'https://storage.googleapis.com/bitlink-image-source/Profile.%20icon%20after.svg?GoogleAccessId=firebase-adminsdk-j7592%40bitlink-project.iam.gserviceaccount.com&Expires=16730323200&Signature=Y3TWhnMv1gDvJtMOv0UjBFlTW9WQZkyRqj8yL%2Bf9DellqlTNUDLh0mgEEWUjGNT3tO2hYQFXc%2FRxO7hvp1az9%2FDjAH2Y30vdqRd7N8MPrNB1kerliF41Mt%2BXEY5wJaDM4JDalHxCzjIH3FEKyi6NNxj1rO3Ku%2BZcElfkO6UrmklT5%2Bp8pcDxA%2BsvjmgzQoqTjk9vFyefIBjCcPuJjwFdd1zpXuaP7Opf34aBGobebJYIrOOIvIO1sX9IrBY0TIhhClSZI7rmEtccoaENcaa0XTNlCL%2FPu8K%2FkhebFiA0V7BsaKg3nuujlsNRKRdUJZmtDZsriIDI9OvOOpQVP7xPgQ%3D%3D';
        profileAvatar.classList.remove('fadeout');
        profileAvatar.classList.add('fadein');
    }, 100);
    
    // Menghapus kelas 'fadein' setelah animasi selesai
    setTimeout(function() {
        profileAvatar.classList.remove('fadein');
        window.location.href = "./Profile.html";
    }, 1000);

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
                var inputValue = $(this).find('a').text().toLowerCase(); // Mengambil teks dari elemen a
                var regex = new RegExp(searchValue);
                if (regex.test(inputValue)) {
                    console.log(inputValue);
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