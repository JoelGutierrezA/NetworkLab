// frontend/app.js

// Función para cargar pacientes desde el API
async function cargarPacientes() {
    try {
        const response = await fetch('/api/pacientes');
        const pacientes = await response.json();
        mostrarPacientes(pacientes);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

// Función para mostrar pacientes en la página
function mostrarPacientes(pacientes) {
    const contenedor = document.getElementById('pacientes-lista');
    
    if (!contenedor) return;
    
    contenedor.innerHTML = pacientes.map(paciente => `
        <div class="paciente-card">
            <h3>${paciente.nombre}</h3>
            <p>Edad: ${paciente.edad} años</p>
            <p>Género: ${paciente.genero}</p>
            <p>Diagnóstico: ${paciente.diagnostico}</p>
            <button onclick="verDetalle(${paciente.id})">Ver detalles</button>
        </div>
    `).join('');
}

// Función para buscar pacientes
async function buscarPacientes() {
    const busqueda = document.getElementById('busqueda').value;
    
    if (busqueda.length < 2) {
        cargarPacientes();
        return;
    }
    
    try {
        const response = await fetch(`/api/pacientes/buscar?nombre=${encodeURIComponent(busqueda)}`);
        const resultados = await response.json();
        mostrarPacientes(resultados);
    } catch (error) {
        console.error('Error en búsqueda:', error);
    }
}

// Función para ver detalles de un paciente
async function verDetalle(id) {
    try {
        const response = await fetch(`/api/pacientes/${id}`);
        const paciente = await response.json();
        
        alert(`Detalles del paciente:\nNombre: ${paciente.nombre}\nEdad: ${paciente.edad}\nDiagnóstico: ${paciente.diagnostico}`);
    } catch (error) {
        console.error('Error al cargar detalles:', error);
    }
}

// Función para verificar el estado del API
async function verificarEstado() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        console.log('API Status:', data);
    } catch (error) {
        console.error('API no disponible:', error);
    }
}

// Cargar pacientes cuando la página se cargue
document.addEventListener('DOMContentLoaded', function() {
    cargarPacientes();
    verificarEstado();
    
    // Agregar event listener para búsqueda
    const inputBusqueda = document.getElementById('busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', buscarPacientes);
    }
});