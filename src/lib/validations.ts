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
    direccion: z.string().trim().optional().or(z.literal('')),
    situacion: z.enum(['activo', 'retiro']),
    jerarquia: z.string().trim().optional().or(z.literal('')),
    unidad: z.string().trim().optional().or(z.literal('')),
    mensaje: z.string().trim().optional().or(z.literal('')),
});
