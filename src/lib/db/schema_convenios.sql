-- Esquema para Convenios Comerciales y Solicitudes de Comercios

CREATE TABLE IF NOT EXISTS convenios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- Salud, Gastronomía, Educación, Indumentaria, Servicios, etc.
    beneficio TEXT NOT NULL,          -- Descripción corta destacada, ej: "15% OFF" o "20% los miércoles"
    descripcion TEXT,                 -- Detalles adicionales
    logo_url VARCHAR(500),            -- URL del logo/foto cargada
    sitio_web VARCHAR(255),           -- URL del sitio web oficial
    whatsapp VARCHAR(100),            -- Número o enlace de WhatsApp
    instagram VARCHAR(100),           -- Usuario o link de Instagram
    telefono VARCHAR(100),            -- Teléfono de contacto
    direccion VARCHAR(255),           -- Dirección del comercio
    destacado BOOLEAN DEFAULT FALSE,  -- Si aparece en el Home
    visible BOOLEAN DEFAULT TRUE,     -- Si está activo y visible para socios
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS convenio_solicitudes (
    id SERIAL PRIMARY KEY,
    comercio_nombre VARCHAR(255) NOT NULL,
    contacto_nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    instagram VARCHAR(100),
    propuesta TEXT NOT NULL,          -- Descripción de lo que ofrece el comercio
    leido BOOLEAN DEFAULT FALSE,       -- Si el administrador ya leyó la solicitud
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
