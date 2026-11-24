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
 * Normaliza un nombre para mostrarlo y ordenarlo con el APELLIDO primero (ej: "CEDRES MARTIN").
 * - Si viene en formato "APELLIDO, NOMBRE", quita la coma dejando "APELLIDO NOMBRE".
 * - Si viene en formato "NOMBRE APELLIDO" (2 palabras) -> "APELLIDO NOMBRE".
 * - Si viene en formato "NOMBRE(S) APELLIDO1 APELLIDO2" (3+ palabras) -> mueve los 2 últimos apellidos al inicio,
 *   respetando preposiciones/artículos compuestos ("DE", "DEL", "LA", "LAS", "LOS", "SAN", "SANTA").
 */
export function formatearNombreApellidoPrimero(nombre: string): string {
    const clean = String(nombre || '').trim().replace(/\s+/g, ' ');
    if (!clean) return '';

    if (clean.includes(',')) {
        const [apellido, resto] = clean.split(',', 2);
        const a = apellido.trim();
        const r = (resto || '').trim();
        return r ? `${a} ${r}` : a;
    }

    const parts = clean.split(' ');
    if (parts.length <= 1) return clean;
    if (parts.length === 2) {
        return `${parts[1]} ${parts[0]}`;
    }

    const conectores = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'SAN', 'SANTA', 'MC', 'MAC']);
    let splitIdx = parts.length - 2;

    // Si la palabra previa al último apellido es conector (ej: "JUAN DE LEON"), incluirla en el apellido
    if (splitIdx > 0 && conectores.has(parts[splitIdx - 1].toUpperCase())) {
        splitIdx -= 1;
        if (splitIdx > 0 && conectores.has(parts[splitIdx - 1].toUpperCase())) {
            splitIdx -= 1;
        }
    }

    if (splitIdx <= 0) {
        splitIdx = parts.length - 1;
    }

    const apellidos = parts.slice(splitIdx).join(' ');
    const nombres = parts.slice(0, splitIdx).join(' ');
    return `${apellidos} ${nombres}`.trim();
}

/**
 * Comparador alfabético en español (insensible a tildes y mayúsculas) por primer apellido.
 */
export function compararPorPrimerApellido(nombreA: string, nombreB: string): number {
    return formatearNombreApellidoPrimero(nombreA).localeCompare(
        formatearNombreApellidoPrimero(nombreB),
        'es',
        { sensitivity: 'base' }
    );
}
