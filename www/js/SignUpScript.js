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

// Fungsi sign up
document.getElementById('signupForm').addEventListener('submit', function(event){
    event.preventDefault();
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let validationMessage = document.getElementById('validationMessage');

    // Username validation
    if (username === '') {
        validationMessage.textContent = "Username field cannot be empty!";
        addShakeEffect();
        return;
    }
    // ----

    // Email validation
    if (email === '') {
        validationMessage.textContent = "Email field cannot be empty!";
        addShakeEffect();
        return;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        validationMessage.textContent = "Email is not valid";
        addShakeEffect();
        return;
    }
    // ----

    // Password validation
    if (password.length < 6) {
        validationMessage.textContent = "Password must be at least 6 characters";
        addShakeEffect();
        return;
    }
    // ----

    // Fetching dari endpoint
    fetch('https://signup-luylauepla-et.a.run.app/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message);
            });
        }
        return response.json();
    })
    .then(data => {
        // validationMessage.innerText = data.message;
        // if user is successfully created, redirect to login page
        window.location.href = "./index.html";
    })
    .catch((error) => {
        console.error(error);
        validationMessage.textContent = error.message.replace("Error: ", "");
        addShakeEffect();
    });    
    // ----

})
// ----

// Transisi
function addSlideEffect() {
    var signupPage = document.getElementById("signupPage");
    signupPage.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        addSlideEffect();
    }, 1000); // Delay
});
// ----