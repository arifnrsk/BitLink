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
const db = getDatabase(app);

// Fungsi untuk menambahkan efek shake pada validasi
function addShakeEffect(element) {
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 500); // Set time delay
}

let validationMessage = document.getElementById('validationMessage');
let message = document.getElementById('message');
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
    }, 1000); // 1000 ms = 2 detik
}
// ----

// Untuk code yang membutuhkan auth
document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {

            const uid = user.uid;
            const dbRef = ref(db, 'users/' + uid + '/shortLinks');
            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
          
                // Clear link container
                document.querySelector(".link-container").innerHTML = '';
          
                for (const key in data) {
                    const linkData = data[key];

                    // Pembuatan element html untuk link title, url, dan short link
                    const linkDiv = document.createElement('div');
                    linkDiv.className = "short-link-div";
                    // ---
          
                    // Pembuatan element html untuk display title dan short link
                    const titleDisplay = document.createElement('p');
                    const shortLinkDisplay = document.createElement('p');

                    // Set value untuk didisplay
                    titleDisplay.textContent = linkData.title;
                    shortLinkDisplay.textContent = "bitlink.cloud/" + linkData.shortLink;
                    // ----

                    // Append element display ke link div
                    linkDiv.appendChild(titleDisplay);
                    linkDiv.appendChild(shortLinkDisplay);
                    // ----
          
                    // Pembuatan element html untuk dropdown div
                    const dropdownDiv = document.createElement('div');
                    dropdownDiv.style.display = 'none';
                    dropdownDiv.className = "dropdownDiv";
                    // ----
          
                    // Define variable
                    const titleInput = document.createElement('input');
                    const urlInput = document.createElement('input');
                    const shortLinkInput = document.createElement('input');
                    // ----

                    // Set input values dan types
                    titleInput.value = linkData.title;
                    titleInput.type = 'text';
                    urlInput.value = linkData.url;
                    urlInput.type = 'text';
                    shortLinkInput.value = linkData.shortLink;
                    shortLinkInput.type = 'text';
                    // ----

                    // Pembuatan element html new div untuk wrap label dan input
                    const shortLinkWrapper = document.createElement('div');
                    shortLinkWrapper.className = "short-group";
                    // ----

                    // Pembuatan element html label untuk shortLinkInput
                    const shortLinkLabel = document.createElement('label');
                    shortLinkLabel.textContent = 'bitlink.cloud/';
                    // ----
                    
                    // Append label dan input ke wrapper div
                    shortLinkWrapper.appendChild(shortLinkLabel);
                    shortLinkWrapper.appendChild(shortLinkInput);
                    // ----
                    
                    // Append input elements ke dropdown div
                    dropdownDiv.appendChild(titleInput);
                    dropdownDiv.appendChild(urlInput);
                    dropdownDiv.appendChild(shortLinkWrapper);
                    // ---

                    // Pembuatan element hmtl button group div
                    const buttonGroup = document.createElement('div');
                    buttonGroup.className = "button-group";
                    // ----

                    // Pembuatan element html copy dan trash buttons
                    const copyButton = document.createElement('button');
                    const trashButton = document.createElement('button');
                    // ----

                    // Set button images dan Append element buttons ke button group
                    copyButton.innerHTML = '<img src="./img/fi-br-copy-alt.svg" alt="Copy">';
                    trashButton.innerHTML = '<img src="./img/fi-br-trash.svg" alt="Trash">';
                    copyButton.className = "button-class";
                    trashButton.className = "button-class";

                    buttonGroup.appendChild(copyButton);
                    buttonGroup.appendChild(trashButton);
                    // ----

                    // Pembuatan element html validation message span dan Append the validation message ke dropdown div
                    const validationMessage = document.createElement('span');
                    validationMessage.id = 'validationMessageShort';

                    dropdownDiv.appendChild(validationMessage);
                    // ----
          
                    // Event listener blur yang berfungsi ketika fokus sudah tidak berada pada area maka akan mengupdate value dalam database
                    titleInput.addEventListener('blur', () => {
                        const newTitle = titleInput.value;
                        if (newTitle === '') {
                            validationMessage.textContent = "Fields cannot be empty.";
                            addShakeEffect(validationMessage);
                        } else {
                            set(ref(db, 'users/' + uid + '/shortLinks/' + key + '/title'), newTitle);
                            location.reload();
                        }
                    });

                    urlInput.addEventListener('blur', () => {
                        const newUrl = urlInput.value;
                        if (newUrl === '') {
                            validationMessage.textContent = "Fields cannot be empty.";
                            addShakeEffect(validationMessage);
                        } else {
                            set(ref(db, 'users/' + uid + '/shortLinks/' + key + '/url'), newUrl);
                            location.reload();
                        }
                    });

                    shortLinkInput.addEventListener('blur', () => {
                        const newShortLink = shortLinkInput.value;
                        if (newShortLink === '') {
                            validationMessage.textContent = "Back URL cannot be empty.";
                            addShakeEffect(validationMessage);
                        } else {
                            const user = auth.currentUser;
                            const token = sessionStorage.getItem('token');
                            
                            if (user && token) {
                                user.getIdToken(true)
                                .then(() => {
                                    // Validasi back URL menggunakan endpoint
                                    fetch("https://add-short-luylauepla-et.a.run.app/check_short_link", {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ shortLink: newShortLink }),
                                    })
                                    .then(async (response) => {
                                        const data = await response.json();
                    
                                        if (response.ok) {
                                            if (data.exists) {
                                                validationMessage.textContent = "Back URL already used, try another.";
                                                addShakeEffect(validationMessage);
                                            } else {
                                                const refPath = 'users/' + uid + '/shortLinks/' + key + '/shortLink';
                                                set(ref(db, refPath), newShortLink)
                                                    .then(() => {
                                                        location.reload();
                                                    })
                                                    .catch((error) => {
                                                        console.log(error);
                                                        validationMessage.textContent = "Error while updating short link: " + error;
                                                        addShakeEffect(validationMessage);
                                                    });
                                            }
                                        } else {
                                            // Handle error response from the server
                                            // ...
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        validationMessage.textContent = "Error while checking back URL: " + error;
                                        addShakeEffect(validationMessage);
                                    });
                                })
                                .catch((error) => {
                                    console.log(error);
                                    validationMessage.textContent = "Error while retrieving user token: " + error;
                                    addShakeEffect(validationMessage);
                                });
                            } else {
                                validationMessage.textContent = "User is not authenticated.";
                                addShakeEffect(validationMessage);
                            }
                        }
                    });
                    // ----

                    // Event listeners untuk copy and trash buttons
                    copyButton.addEventListener('click', () => {
                        let fullShortLink = "bitlink.cloud/" + shortLinkInput.value;
                        navigator.clipboard.writeText(fullShortLink)
                            .then(() => {
                                showMessage("Short link copied to clipboard!");
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
                                    if(successful)
                                        showMessage("Short link copied to clipboard!");
                                    else
                                        showMessage("Short link failed to copied");                                        
                                } catch (err) {
                                    showMessage("Fallback copying failed " + err);                                        
                                }
                                
                                document.body.removeChild(textArea);
                            });
                    });
                    
                    trashButton.addEventListener('click', () => {
                        const shortLinkRef = ref(db, `users/${uid}/shortLinks/${key}`);
                        remove(shortLinkRef)
                            .then(() => {
                                showMessage("Short link deleted"); 
                                linkDiv.remove();
                            })
                            .catch((error) => {
                                console.error("Error deleting short link: ", error);
                                showMessage("Error deleting short link: " + error); 
                            });
                    });
                    // ----
                    
                    // Append dropdown div ke link div dan Append button group ke dropdown div
                    linkDiv.appendChild(dropdownDiv);
                    linkDiv.appendChild(buttonGroup);
                    // ----
          
                    // Event listener untuk title ketika dropdown
                    titleDisplay.addEventListener('click', () => {
                        if (dropdownDiv.style.display === 'none') {
                            dropdownDiv.style.display = 'flex';
                        } else {
                            dropdownDiv.style.display = 'none';
                        }
                    });
                    // ----

                    // Append link div ke link container
                    document.querySelector(".link-container").appendChild(linkDiv);
                    // ----
                }
                hideLoadingScreen();
            });
        } else {
            // User logout
            window.location.href = "./index.html";
        }
    });
});
// ----

// Menampilkan dan menyembunyikan popup form saat Add button ditekan
document.getElementById("addButton").addEventListener("click", function() {
    this.classList.add('rotate');
    setTimeout(() => this.classList.remove('rotate'), 400);
    document.getElementById("popup-form").style.display = "block";
});

document.getElementById("close-button").addEventListener("click", function() {
    document.getElementById("popup-form").style.display = "none";
});
// ----

// Membuat form submission handler
document.getElementById('link-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const link = document.getElementById('link').value;
    const shortLinkValue = document.getElementById('short-link').value;
    const popUpForm = document.getElementById("popup-form");
    const shortLink = `${shortLinkValue}`;

    if (!title || !link || !shortLink) {
        validationMessage.textContent = "Fields cannot be empty.";
        addShakeEffect(validationMessage);
        return;
    }

    const user = auth.currentUser;

    user.getIdToken(true).then((token) => {
        // Refresh token
        sessionStorage.setItem('token', token);

        // Validasi back URL menggunakan endpoint
        fetch("https://add-short-luylauepla-et.a.run.app/check_short_link", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shortLink }),
        })
        .then(async (response) => {
            const data = await response.json();

            if (response.ok) {
                if (data.exists) {
                    validationMessage.textContent = "Back URL already used, try another.";
                    addShakeEffect(validationMessage);
                } else {
                    // Ketika back url tersedia maka panggil endpoint untuk pembuatan short link
                    fetch("https://add-short-luylauepla-et.a.run.app/add_short_link", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token 
                        },
                        body: JSON.stringify({ title, link, shortLink }),
                    })
                    .then(async (response) => {
                        const data = await response.json();

                        if (response.ok) {
                            popUpForm.style.display = 'none';
                            location.reload();
                        } else {
                            // alert('Error creating short link: ' + data.message);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        validationMessage.textContent = "Error while creating short link: " + error;
                        addShakeEffect(validationMessage);
                    });
                }
            } else {
                // Handle error response from the server
                // ...
            }
        })
        .catch((error) => {
            console.log(error);
            validationMessage.textContent = "Error while checking back URL: " + error;
            addShakeEffect(validationMessage);
        });
    });
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

        $('.short-link-div').removeClass("blink");

        if (searchValue !== "") {
            $('.short-link-div').each(function(){
                var isMatchFound = false;
                $(this).find('p').each(function(){
                    var inputValue = $(this).text().toLowerCase();
                    var regex = new RegExp(searchValue);
                    if (regex.test(inputValue)) {
                        isMatchFound = true;
                        // Keluar dari loop .each()
                        return false; 
                    }
                });

                if (isMatchFound) {
                    // Ubah warna latar belakang
                    $(this).addClass("blink"); 
                }
            });

            // Scroll ke elemen pertama yang cocok
            var firstMatch = $('.blink').first();
            if (firstMatch.length > 0) {
                var topPos = firstMatch.offset().top - 300; 
                if($(window).scrollTop() !== topPos){
                    $('html, body').animate({
                        scrollTop: topPos
                    }, 500);
                }
            }
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
