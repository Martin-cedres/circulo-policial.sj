import { z } from 'zod';

export const contactoSchema = z.object({
    nombre: z.string().trim().min(1, 'Ingresa tu nombre'),
    email: z.string().trim().min(5, 'Ingresa un correo válido'), // Quitamos .email() temporalmente para diagnóstico
    telefono: z.string().trim().optional().or(z.literal('')),
    asunto: z.string().trim().min(1, 'Ingresa un asunto').optional().or(z.literal('')),
    mensaje: z.string().trim().min(1, 'El mensaje es obligatorio'),
});

export const sociosSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
    cedula: z.string().trim().min(6, 'Cédula inválida'),
    email: z.string().trim().min(5, 'Email inválido'),
    telefono: z.string().trim().min(8, 'Teléfono inválido'),
    direccion: z.string().trim().min(1, 'La dirección de domicilio es obligatoria'),
    situacion: z.enum(['activo', 'retiro', 'policia_actividad', 'policia_retirado', 'civil']),
    pertenencia_presupuestal: z.string().trim().optional().or(z.literal('')),
    jerarquia: z.string().trim().optional().or(z.literal('')),
    unidad: z.string().trim().optional().or(z.literal('')),
    mensaje: z.string().trim().optional().or(z.literal('')),
});

export const convenioSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre del comercio es obligatorio'),
    categoria: z.string().trim().min(1, 'La categoría es obligatoria'),
    beneficio: z.string().trim().min(1, 'El beneficio es obligatorio'),
    descripcion: z.string().trim().optional().or(z.literal('')),
    logo_url: z.string().trim().optional().or(z.literal('')),
    sitio_web: z.string().trim().optional().or(z.literal('')),
    whatsapp: z.string().trim().optional().or(z.literal('')),
    instagram: z.string().trim().optional().or(z.literal('')),
    telefono: z.string().trim().optional().or(z.literal('')),
    direccion: z.string().trim().optional().or(z.literal('')),
    destacado: z.boolean().optional().default(false),
    visible: z.boolean().optional().default(true),
    latitud: z.any().optional(),
    longitud: z.any().optional(),
});

export const solicitudConvenioSchema = z.object({
    comercio_nombre: z.string().trim().min(1, 'El nombre del comercio es obligatorio'),
    contacto_nombre: z.string().trim().min(1, 'El nombre de contacto es obligatorio'),
    email: z.string().trim().min(5, 'El correo electrónico debe ser válido'),
    telefono: z.string().trim().min(1, 'El teléfono es obligatorio'),
    whatsapp: z.string().trim().optional().or(z.literal('')),
    instagram: z.string().trim().optional().or(z.literal('')),
    propuesta: z.string().trim().min(1, 'La propuesta de beneficio es obligatoria'),
});
