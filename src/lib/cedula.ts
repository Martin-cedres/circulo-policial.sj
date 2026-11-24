/**
 * Utilidades para Cédula de Identidad Uruguaya y ordenamiento de socios.
 */

const FACTORES_CI_UY = [2, 9, 8, 7, 6, 3, 4] as const;

/**
 * Calcula el dígito verificador oficial para una cédula uruguaya (sin dígito verificador).
 * Acepta entre 1 y 7 dígitos numéricos.
 */
export function calcularDigitoVerificadorCI(cedulaSinDv: string): string | null {
    const clean = String(cedulaSinDv || '').replace(/\D/g, '');
    if (!clean || clean.length > 7) return null;

    const padded = clean.padStart(7, '0');
    let suma = 0;
    for (let i = 0; i < 7; i++) {
        suma += Number(padded[i]) * FACTORES_CI_UY[i];
    }
    const resto = suma % 10;
    const dv = resto === 0 ? 0 : 10 - resto;
    return String(dv);
}

/**
 * Valida si el dígito verificador corresponde a la cédula uruguaya ingresada.
 */
export function validarCedulaUY(cedulaSinDv: string, dv: string): boolean {
    const esperado = calcularDigitoVerificadorCI(cedulaSinDv);
    if (esperado === null) return false;
    return esperado === String(dv || '').trim();
}

/**
 * Formatea una cédula uruguaya con puntos y guión (ej: 1.234.567-8).
 */
export function formatearCedulaUY(cedulaSinDv: string, dv: string): string {
    const clean = String(cedulaSinDv || '').replace(/\D/g, '');
    const num = parseInt(clean, 10);
    const dvClean = String(dv || '').trim();
    if (isNaN(num)) return dvClean ? `${clean}-${dvClean}` : clean;
    return dvClean ? `${num.toLocaleString('es-UY')}-${dvClean}` : num.toLocaleString('es-UY');
}

/**
 * Normaliza un nombre para ordenarlo alfabéticamente por el primer nombre.
 * - Si viene en formato "APELLIDO, NOMBRE", prioriza la parte posterior a la coma.
 * - Si viene en formato "NOMBRE APELLIDO", ordena desde el inicio.
 */
export function claveOrdenPrimerNombre(nombre: string): string {
    const trimmed = String(nombre || '').trim();
    if (!trimmed) return '';

    if (trimmed.includes(',')) {
        const [apellido, resto] = trimmed.split(',', 2);
        const primerParte = (resto || '').trim();
        return primerParte ? `${primerParte} ${apellido.trim()}` : trimmed;
    }

    return trimmed;
}

/**
 * Comparador alfabético en español (insensible a tildes y mayúsculas) por primer nombre.
 */
export function compararPorPrimerNombre(nombreA: string, nombreB: string): number {
    return claveOrdenPrimerNombre(nombreA).localeCompare(
        claveOrdenPrimerNombre(nombreB),
        'es',
        { sensitivity: 'base' }
    );
}
