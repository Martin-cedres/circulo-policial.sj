-- Tabla Maestra de Socios
CREATE TABLE IF NOT EXISTS socios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    digito_verificador VARCHAR(10) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'haberes', -- 'haberes' (descuento Jefatura) o 'externo' (pago por fuera)
    estado VARCHAR(50) DEFAULT 'activo', -- 'activo', 'baja'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Presupuestos Mensuales (Cabecera)
CREATE TABLE IF NOT EXISTS descuento_presupuestos (
    id SERIAL PRIMARY KEY,
    anio INT NOT NULL,
    mes INT NOT NULL,
    codigo_descuento INT DEFAULT 514,
    unidad_ejecutora INT DEFAULT 19,
    responsable VARCHAR(255) DEFAULT 'DARCY GONZALEZ',
    estado VARCHAR(50) DEFAULT 'borrador', -- 'borrador', 'cerrado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(anio, mes)
);

-- Detalle del Presupuesto (Socios incluidos en la liquidación del mes)
CREATE TABLE IF NOT EXISTS descuento_presupuestos_detalle (
    id SERIAL PRIMARY KEY,
    presupuesto_id INT REFERENCES descuento_presupuestos(id) ON DELETE CASCADE,
    socio_id INT REFERENCES socios(id) ON DELETE CASCADE,
    importe NUMERIC(10, 2) DEFAULT 140.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(presupuesto_id, socio_id)
);
