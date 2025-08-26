import datetime
import os
from functools import wraps

import jwt
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

# Cargar variables de entorno
load_dotenv()

# Crear la aplicación Flask
# Después de crear la app, agrega:
app = Flask(__name__, 
            template_folder='../frontend',
            static_folder='../frontend', 
            static_url_path='')

# ✅ AGREGA ESTA LÍNEA (justo después de crear la app)
CORS(app)

# Configuración
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)

# Función para conectar a MySQL
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='123456',
            database='plataforma_web',
            charset='utf8mb4'
        )
        return conn
    except Exception as e:
        print(f"❌ Error de conexión MySQL: {e}")
        return None

# Middleware para verificar token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token requerido'}), 401
        
        try:
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user_id']
        except Exception as e:
            print(f"❌ Error decodificando token: {e}")
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# Ruta principal
@app.route('/')
def inicio():
    return render_template('index.html')

# API: Estado del sistema
@app.route('/api/status')
def api_status():
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'online', 'database': 'MySQL'})
    return jsonify({'status': 'error', 'database': 'MySQL'}), 500

# API: Obtener todos los pacientes
@app.route('/api/pacientes')
def obtener_pacientes():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Error de conexión a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM patients;')
        pacientes = cursor.fetchall()
        
        # Convertir a formato JSON
        pacientes_json = []
        for paciente in pacientes:
            pacientes_json.append({
                'patient_id': paciente[0],
                'age': paciente[1],
                'gender': paciente[2],
                'occupation_id': paciente[3],
                'residential_area_id': paciente[4],
                'bmi': float(paciente[5]) if paciente[5] else None,
                'physical_activity_level': paciente[6],
                'dietary_habits': paciente[7],
                'air_quality_index': paciente[8],
                'family_history_cancer': bool(paciente[9]),
                'previous_cancer_diagnosis': bool(paciente[10])
            })
        
        cursor.close()
        conn.close()
        
        return jsonify(pacientes_json)
        
    except Exception as e:
        print(f"❌ Error al obtener pacientes: {e}")
        return jsonify({'error': 'Error al obtener pacientes'}), 500

# API: Registro de usuarios
@app.route('/api/auth/registro', methods=['POST'])
def registro_usuario():
    try:
        data = request.get_json()
        
        # Verificar campos obligatorios
        if not all([data.get('email'), data.get('password'), data.get('nombre'), data.get('apellido')]):
            return jsonify({'error': 'Faltan campos obligatorios'}), 400
        
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = conn.cursor()
        
        # Verificar si el email ya existe
        cursor.execute('SELECT id FROM usuarios WHERE email = %s', (data['email'],))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Hash de la contraseña
        password_hash = generate_password_hash(data['password'])
        
        # Insertar nuevo usuario
        cursor.execute('''
            INSERT INTO usuarios (email, password_hash, nombre, apellido, especialidad, registro_medico, telefono)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['email'], password_hash, data['nombre'], data['apellido'],
            data.get('especialidad'), data.get('registro_medico'), data.get('telefono')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Usuario registrado exitosamente'}), 201
        
    except Exception as e:
        print(f"❌ Error en registro: {e}")
        return jsonify({'error': 'Error al registrar usuario'}), 500

# API: Login de usuarios
@app.route('/api/auth/login', methods=['POST'])
def login_usuario():
    try:
        data = request.get_json()
        
        # Verificar campos obligatorios
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y password requeridos'}), 400
        
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, email, password_hash, nombre, apellido, especialidad 
            FROM usuarios WHERE email = %s AND activo = TRUE
        ''', (data['email'],))
        
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if usuario and check_password_hash(usuario[2], data['password']):
            # Crear token JWT
            token = jwt.encode({
                'user_id': usuario[0],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'token': token,
                'usuario': {
                    'id': usuario[0],
                    'email': usuario[1],
                    'nombre': usuario[3],
                    'apellido': usuario[4],
                    'especialidad': usuario[5]
                }
            })
        else:
            return jsonify({'error': 'Credenciales inválidas'}), 401
            
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return jsonify({'error': 'Error en el login'}), 500

# API: Perfil de usuario protegido
@app.route('/api/usuarios/perfil', methods=['GET'])
@token_required
def perfil_usuario(current_user):
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Error de conexión a la base de datos'}), 500
        
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, email, nombre, apellido, especialidad, registro_medico, telefono
            FROM usuarios WHERE id = %s
        ''', (current_user,))
        
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if usuario:
            return jsonify({
                'id': usuario[0],
                'email': usuario[1],
                'nombre': usuario[2],
                'apellido': usuario[3],
                'especialidad': usuario[4],
                'registro_medico': usuario[5],
                'telefono': usuario[6]
            })
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
    except Exception as e:
        print(f"❌ Error al obtener perfil: {e}")
        return jsonify({'error': 'Error al obtener perfil'}), 500

# Manejo de errores
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Error interno del servidor'}), 500

# Ejecutar la aplicación
if __name__ == '__main__':
    print("🚀 Servidor Flask iniciado en http://127.0.0.1:5000")
    print("📊 Conectando a MySQL...")
    app.run(debug=True, port=5000)