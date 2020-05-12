var socket = io();

socket.on("new message", data => {
    console.log(data);
});

socket.on("add chat", data => {
    console.log("add chat", data);
});

socket.on("*", data => {
    console.log(data);
});

function register() {
    $.post('api/user/register', {
        email: 'neotje111@gmail.com',
        password: 'test12345',
        personal: {
            firstname: 'neo',
            lastname: 'hop'
        },
        message: 'hallo neo ik wil websitje'
    }, json => {
        console.log(json);
        
    }, 'json');
}

function login() {
    $.post('api/user/login', {
        email: 'neotje111@gmail.com',
        password: 'test12345'
    }, json => {
        console.log(json);
        
    }, 'json');
}

function current() {
    $.getJSON('api/user/current', {}, json => {
        console.log(json);
    });
}

function verify(token) {
    $.post('api/user/verify', {token: token}, json => {
        console.log(json);
    }, 'json');
}

function change(o, n) {
    $.post('api/user/changePassword', {old: o, new: n}, json => {
        console.log(json);
    }, 'json');
}

function logout() {
    $.getJSON('api/user/logout', {}, json => {
        console.log(json);
    })
}