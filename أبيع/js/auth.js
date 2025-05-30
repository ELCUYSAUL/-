// auth.js - Manejo de autenticación y perfiles de usuario
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const authSection = document.getElementById('auth-section');
    const mainSection = document.getElementById('main-section');
    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const storeNameDisplay = document.getElementById('store-name');

    // Datos de usuario (simulando una base de datos simple)
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Inicializar la vista según el estado de autenticación
    function initAuth() {
        if (currentUser) {
            showMainSection();
        } else {
            showAuthSection();
        }
    }

    // Mostrar sección de autenticación
    function showAuthSection() {
        authSection.classList.add('active');
        mainSection.classList.remove('active');
    }

    // Mostrar sección principal
    function showMainSection() {
        authSection.classList.remove('active');
        mainSection.classList.add('active');
        storeNameDisplay.textContent = `Tienda de ${currentUser.name}`;
    }

    // Crear o cargar perfil de usuario
    function handleLogin() {
        const username = usernameInput.value.trim();

        if (!username) {
            alert('Por favor ingresa tu nombre');
            return;
        }

        // Buscar usuario existente o crear uno nuevo
        let user = users.find(u => u.name.toLowerCase() === username.toLowerCase());

        if (!user) {
            user = {
                id: Date.now(),
                name: username,
                createdAt: new Date().toISOString()
            };
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
        }

        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showMainSection();
        usernameInput.value = '';
    }

    // Cerrar sesión
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuthSection();
    }

    // Event Listeners
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Permitir login con Enter
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Inicializar la aplicación
    initAuth();
});