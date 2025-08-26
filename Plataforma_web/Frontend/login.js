// login.js - Conexión real con backend Flask
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loader = document.getElementById('loginLoader');
    const loginBtn = document.querySelector('#loginForm button[type="submit"]');
    
    // Validación básica
    if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    // Mostrar loader y deshabilitar botón
    loader.style.display = 'block';
    loginBtn.disabled = true;
    
    try {
        // CONEXIÓN REAL CON TU BACKEND FLASK
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        window.location.href = 'dashboard.html';
        const data = await response.json();
        
        if (response.ok) {
            // ✅ Login exitoso - Guardar token y redirigir
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            
            // Redirigir al dashboard
            window.location.href = 'dashboard.html';
        } else {
            // ❌ Error de login
            alert('Error: ' + (data.error || 'Credenciales incorrectas'));
        }
        
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor');
    } finally {
        // Ocultar loader y habilitar botón
        loader.style.display = 'none';
        loginBtn.disabled = false;
    }
});

// Animación de entrada (tu código original)
document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.querySelector('.login-container');
    loginContainer.style.opacity = '0';
    loginContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        loginContainer.style.transition = 'all 0.6s ease';
        loginContainer.style.opacity = '1';
        loginContainer.style.transform = 'translateY(0)';
    }, 100);
    
    // Verificar si ya está logueado
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
    }
});