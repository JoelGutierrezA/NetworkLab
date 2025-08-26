// Dashboard JavaScript - PulmoPredict

// Datos de ejemplo de pacientes
const patientsData = [
    {
        id: "001",
        name: "María González Pérez",
        rut: "12.345.678-9",
        age: 67,
        lastEvaluation: "15/08/2025",
        risk: "high",
        status: "pending",
        phone: "+56 9 1234 5678",
        email: "maria.gonzalez@email.com",
        smoker: "Sí (30 años)",
        symptoms: ["Tos persistente", "Dificultad respiratoria"],
        notes: "Paciente con historial familiar de cáncer pulmonar"
    },
    {
        id: "002",
        name: "Carlos Rodríguez Silva",
        rut: "98.765.432-1",
        age: 54,
        lastEvaluation: "20/08/2025",
        risk: "low",
        status: "completed",
        phone: "+56 9 8765 4321",
        email: "carlos.rodriguez@email.com",
        smoker: "No",
        symptoms: ["Chequeo preventivo"],
        notes: "Paciente sin antecedentes relevantes"
    },
    {
        id: "003",
        name: "Ana Martínez López",
        rut: "11.222.333-4",
        age: 72,
        lastEvaluation: "18/08/2025",
        risk: "medium",
        status: "in-progress",
        phone: "+56 9 1122 3344",
        email: "ana.martinez@email.com",
        smoker: "Ex-fumadora (10 años sin fumar)",
        symptoms: ["Fatiga", "Dolor torácico leve"],
        notes: "Seguimiento por antecedentes de tabaquismo"
    },
    {
        id: "004",
        name: "Roberto Fernández",
        rut: "55.444.333-2",
        age: 61,
        lastEvaluation: "22/08/2025",
        risk: "low",
        status: "completed",
        phone: "+56 9 5544 3322",
        email: "roberto.fernandez@email.com",
        smoker: "No",
        symptoms: ["Chequeo anual"],
        notes: "Paciente saludable, chequeo rutinario"
    }
];

// Estado actual de la aplicación
let currentFilter = 'todos';
let currentSearchTerm = '';

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    bindEventListeners();
    loadUserData();
});

// Cargar datos del usuario desde localStorage
function loadUserData() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('welcomeUser').textContent = `Bienvenido, Dr. ${user.nombre} ${user.apellido}`;
    }
}

// Inicializar dashboard
function initializeDashboard() {
    renderPatientsTable();
    updateStatistics();
}

// Vincular event listeners
function bindEventListeners() {
    // Botón nuevo paciente
    document.getElementById('newPatientBtn').addEventListener('click', function() {
        alert('Funcionalidad de nuevo paciente - Por implementar');
    });

    // Botón importar datos
    document.getElementById('importDataBtn').addEventListener('click', function() {
        alert('Funcionalidad de importar datos - Por implementar');
    });

    // Búsqueda de pacientes
    document.getElementById('searchPatients').addEventListener('input', function(e) {
        currentSearchTerm = e.target.value.toLowerCase();
        renderPatientsTable();
    });

    // Filtros de pacientes
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            renderPatientsTable();
        });
    });

    // Modal de paciente
    const modal = document.getElementById('patientModal');
    const closeModal = document.getElementById('closeModal');
    const closeModalX = document.querySelector('.close-modal');

    closeModal.addEventListener('click', hidePatientModal);
    closeModalX.addEventListener('click', hidePatientModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            hidePatientModal();
        }
    });

    // Event delegation para botones de acciones
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-btn')) {
            const patientRow = e.target.closest('.patient-row');
            const patientId = patientRow.getAttribute('data-patient-id');
            
            if (e.target.classList.contains('view')) {
                showPatientDetails(patientId);
            } else if (e.target.classList.contains('analyze')) {
                analyzePatient(patientId);
            } else if (e.target.classList.contains('edit')) {
                editPatient(patientId);
            }
        }
    });

    // Botón de análisis en modal
    document.getElementById('analyzePatient').addEventListener('click', function() {
        alert('Iniciando análisis predictivo...');
        hidePatientModal();
    });
}

// Renderizar tabla de pacientes
function renderPatientsTable() {
    const tableBody = document.getElementById('patientsTableBody');
    const filteredPatients = filterPatients();
    
    if (filteredPatients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #718096;">
                    No se encontraron pacientes que coincidan con los criterios.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredPatients.map(patient => `
        <tr class="patient-row" data-patient-id="${patient.id}">
            <td><strong>#${patient.id}</strong></td>
            <td>
                <div class="patient-info">
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-rut">${patient.rut}</div>
                </div>
            </td>
            <td>${patient.age} años</td>
            <td>${patient.lastEvaluation}</td>
            <td><span class="risk-badge ${patient.risk}">${getRiskLabel(patient.risk)}</span></td>
            <td><span class="status-badge ${patient.status}">${getStatusLabel(patient.status)}</span></td>
            <td class="actions-cell">
                <button class="action-btn view" title="Ver detalles">👁️</button>
                <button class="action-btn analyze" title="Analizar">🔍</button>
                <button class="action-btn edit" title="Editar">✏️</button>
            </td>
        </tr>
    `).join('');
}

// Filtrar pacientes según criterios actuales
function filterPatients() {
    let filtered = patientsData;

    // Aplicar filtro de búsqueda
    if (currentSearchTerm) {
        filtered = filtered.filter(patient => 
            patient.name.toLowerCase().includes(currentSearchTerm) ||
            patient.rut.includes(currentSearchTerm) ||
            patient.id.includes(currentSearchTerm)
        );
    }

    // Aplicar filtro de categoría
    switch (currentFilter) {
        case 'alto-riesgo':
            filtered = filtered.filter(p => p.risk === 'high');
            break;
        case 'pendientes':
            filtered = filtered.filter(p => p.status === 'pending');
            break;
        case 'recientes':
            // Últimos 7 días (simulado)
            filtered = filtered.filter(p => {
                const evalDate = new Date(p.lastEvaluation.split('/').reverse().join('-'));
                const today = new Date();
                const diffTime = Math.abs(today - evalDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            });
            break;
        default:
            // 'todos' - no filtrar
            break;
    }

    return filtered;
}

// Obtener etiqueta de riesgo
function getRiskLabel(risk) {
    const labels = {
        'high': 'Alto',
        'medium': 'Medio',
        'low': 'Bajo'
    };
    return labels[risk] || risk;
}

// Obtener etiqueta de estado
function getStatusLabel(status) {
    const labels = {
        'completed': 'Completado',
        'pending': 'Pendiente',
        'in-progress': 'En Proceso'
    };
    return labels[status] || status;
}

// Mostrar detalles del paciente
function showPatientDetails(patientId) {
    const patient = patientsData.find(p => p.id === patientId);
    if (!patient) return;

    const modal = document.getElementById('patientModal');
    const detailsContainer = document.getElementById('patientDetails');

    // Mostrar loading primero
    detailsContainer.innerHTML = `
        <div class="patient-details-loading">
            <div class="loading-spinner"></div>
            <p>Cargando información del paciente...</p>
        </div>
    `;

    modal.style.display = 'block';

    // Simular carga de datos
    setTimeout(() => {
        detailsContainer.innerHTML = `
            <div class="patient-details">
                <div class="patient-header">
                    <h4>${patient.name}</h4>
                    <span class="risk-badge ${patient.risk}">${getRiskLabel(patient.risk)} Riesgo</span>
                </div>
                
                <div class="patient-info-grid">
                    <div class="info-group">
                        <label>Información Personal</label>
                        <div class="info-item">
                            <strong>RUT:</strong> ${patient.rut}
                        </div>
                        <div class="info-item">
                            <strong>Edad:</strong> ${patient.age} años
                        </div>
                        <div class="info-item">
                            <strong>Teléfono:</strong> ${patient.phone}
                        </div>
                        <div class="info-item">
                            <strong>Email:</strong> ${patient.email}
                        </div>
                    </div>

                    <div class="info-group">
                        <label>Historial Médico</label>
                        <div class="info-item">
                            <strong>Fumador:</strong> ${patient.smoker}
                        </div>
                        <div class="info-item">
                            <strong>Síntomas:</strong> ${patient.symptoms.join(', ')}
                        </div>
                        <div class="info-item">
                            <strong>Última Evaluación:</strong> ${patient.lastEvaluation}
                        </div>
                        <div class="info-item">
                            <strong>Estado:</strong> ${getStatusLabel(patient.status)}
                        </div>
                    </div>

                    <div class="info-group full-width">
                        <label>Notas Médicas</label>
                        <div class="info-item">
                            ${patient.notes}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }, 800);
}

// Ocultar modal de paciente
function hidePatientModal() {
    document.getElementById('patientModal').style.display = 'none';
}

// Analizar paciente
function analyzePatient(patientId) {
    const patient = patientsData.find(p => p.id === patientId);
    if (!patient) return;

    if (confirm(`¿Desea realizar un análisis predictivo para ${patient.name}?`)) {
        // Aquí se conectaría con el backend/ML
        alert(`Iniciando análisis predictivo para ${patient.name}...\n\nEsto se conectará con tu modelo de Machine Learning en Colab.`);
    }
}

// Editar paciente
function editPatient(patientId) {
    const patient = patientsData.find(p => p.id === patientId);
    if (!patient) return;

    alert(`Editando paciente: ${patient.name}\n\nEsta funcionalidad se implementará en la siguiente fase del proyecto.`);
}

// Actualizar estadísticas
function updateStatistics() {
    // Calcular estadísticas dinámicas
    const totalPatients = patientsData.length;
    const pendingAnalysis = patientsData.filter(p => p.status === 'pending').length;
    const highRiskPatients = patientsData.filter(p => p.risk === 'high').length;
    const lowRiskPatients = patientsData.filter(p => p.risk === 'low').length;

    // Actualizar elementos del DOM
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[0]) statCards[0].querySelector('h3').textContent = totalPatients;
    if (statCards[1]) statCards[1].querySelector('h3').textContent = pendingAnalysis;
    if (statCards[2]) statCards[2].querySelector('h3').textContent = highRiskPatients;
    if (statCards[3]) statCards[3].querySelector('h3').textContent = lowRiskPatients;
}

// Funciones adicionales para futuras implementaciones

// Exportar datos
function exportPatientData() {
    const dataStr = JSON.stringify(patientsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'pacientes_pulmopredict.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Función para conectar con backend (futura implementación)
async function connectToBackend(endpoint, data) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error en la conexión con el servidor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Por favor, intente nuevamente.');
    }
}

// Validar datos de paciente
function validatePatientData(patientData) {
    const required = ['name', 'rut', 'age'];
    const missing = required.filter(field => !patientData[field]);
    
    if (missing.length > 0) {
        alert(`Faltan campos requeridos: ${missing.join(', ')}`);
        return false;
    }
    
    // Validar RUT chileno básico
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!rutRegex.test(patientData.rut)) {
        alert('Formato de RUT inválido. Use formato: 12.345.678-9');
        return false;
    }
    
    return true;
}

console.log('Dashboard PulmoPredict inicializado correctamente');