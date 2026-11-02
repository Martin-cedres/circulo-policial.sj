const MESES_NOMBRES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MESES_CORTOS = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

/**
 * Retorna el período actual en formato 'YYYY-MM' en zona horaria de Uruguay
 */
export function getPeriodoActual(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Suma `deltaMeses` a un período 'YYYY-MM' y devuelve el nuevo 'YYYY-MM'
 */
export function sumarMesesPeriodo(periodo: string, deltaMeses: number): string {
    const [yearStr, monthStr] = periodo.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (isNaN(year) || isNaN(month)) return getPeriodoActual();

    const totalMonths = year * 12 + (month - 1) + deltaMeses;
    const newYear = Math.floor(totalMonths / 12);
    const newMonth = (totalMonths % 12) + 1;
    return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

/**
 * Convierte 'YYYY-MM' en etiqueta legible, ej: '2026-11' -> 'Noviembre 2026'
 */
export function formatearPeriodoLargo(periodo: string | null | undefined): string {
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) return 'Sin registro';
    const [yearStr, monthStr] = periodo.split('-');
    const monthIdx = parseInt(monthStr, 10) - 1;
    if (monthIdx < 0 || monthIdx > 11) return periodo;
    return `${MESES_NOMBRES[monthIdx]} ${yearStr}`;
}

/**
 * Convierte 'YYYY-MM' en etiqueta corta, ej: '2026-11' -> 'Nov 2026'
 */
export function formatearPeriodoCorto(periodo: string | null | undefined): string {
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) return '—';
    const [yearStr, monthStr] = periodo.split('-');
    const monthIdx = parseInt(monthStr, 10) - 1;
    if (monthIdx < 0 || monthIdx > 11) return periodo;
    return `${MESES_CORTOS[monthIdx]} ${yearStr}`;
}

/**
 * Genera el array de períodos ['YYYY-MM', ...] desde `periodoDesde` por `cantidadMeses`
 */
export function generarRangoPeriodos(periodoDesde: string, cantidadMeses: number): string[] {
    const count = Math.max(1, Math.min(36, cantidadMeses));
    const lista: string[] = [];
    for (let i = 0; i < count; i++) {
        lista.push(sumarMesesPeriodo(periodoDesde, i));
    }
    return lista;
}

/**
 * Calcula automáticamente el período de inicio, fin y detalle legible
 * a partir del último período pagado del socio (`pagadoHastaActual`).
 */
export function calcularCoberturaPago(
    pagadoHastaActual: string | null | undefined,
    cantidadMeses: number,
    periodoInicioManual?: string | null
): {
    periodoDesde: string;
    periodoHasta: string;
    periodosLista: string[];
    periodosDetalle: string;
} {
    const mesActual = getPeriodoActual();
    let periodoDesde = mesActual;

    if (periodoInicioManual && /^\d{4}-\d{2}$/.test(periodoInicioManual)) {
        periodoDesde = periodoInicioManual;
    } else if (pagadoHastaActual && /^\d{4}-\d{2}$/.test(pagadoHastaActual)) {
        // Si ya tiene pagado hasta el mes actual o posterior, el nuevo pago arranca en el mes siguiente
        if (pagadoHastaActual >= mesActual) {
            periodoDesde = sumarMesesPeriodo(pagadoHastaActual, 1);
        } else {
            // Si su último pago era el mes inmediatamente anterior, continúa desde el siguiente (que es el actual)
            periodoDesde = sumarMesesPeriodo(pagadoHastaActual, 1);
            // Si estaba muy atrasado (más de 3 meses atrás), comenzamos en el mes actual salvo indicación manual
            const [yPag, mPag] = pagadoHastaActual.split('-').map(Number);
            const [yAct, mAct] = mesActual.split('-').map(Number);
            const diffMeses = (yAct * 12 + mAct) - (yPag * 12 + mPag);
            if (diffMeses > 3) {
                periodoDesde = mesActual;
            }
        }
    }

    const count = Math.max(1, Math.min(36, Number(cantidadMeses) || 1));
    const periodosLista = generarRangoPeriodos(periodoDesde, count);
    const periodoHasta = periodosLista[periodosLista.length - 1];
    const periodosDetalle = periodosLista.map(p => formatearPeriodoCorto(p)).join(', ');

    return {
        periodoDesde,
        periodoHasta,
        periodosLista,
        periodosDetalle,
    };
}

/**
 * Determina cuándo le corresponde recibir el próximo recordatorio automático
 */
export function obtenerProximoMesCobro(pagadoHasta: string | null | undefined): string {
    const mesActual = getPeriodoActual();
    if (!pagadoHasta || !/^\d{4}-\d{2}$/.test(pagadoHasta) || pagadoHasta < mesActual) {
        return mesActual;
    }
    return sumarMesesPeriodo(pagadoHasta, 1);
}

/**
 * Convierte un array de períodos en un texto fluido en español:
 * ej. ['2026-11'] -> 'Noviembre de 2026'
 * ej. ['2026-11', '2026-12'] -> 'Noviembre 2026 y Diciembre 2026'
 * ej. ['2026-11', '2026-12', '2027-01'] -> 'Noviembre 2026, Diciembre 2026 y Enero 2027'
 */
export function formatearListaMesesTexto(periodosLista: string[]): string {
    if (!periodosLista || periodosLista.length === 0) return 'el período actual';
    const nombres = periodosLista.map(p => formatearPeriodoLargo(p));
    if (nombres.length === 1) return nombres[0];
    if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
    return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

/**
 * Retorna la fecha exacta y redacción del próximo recordatorio automático
 */
export function obtenerDetalleProximoAviso(pagadoHasta: string | null | undefined): {
    proximoPeriodo: string;
    diaTexto: string;
    mesTexto: string;
    anioTexto: string;
    textoCompleto: string;
} {
    const proximoPeriodo = obtenerProximoMesCobro(pagadoHasta);
    const [anioStr, mesStr] = proximoPeriodo.split('-');
    const mesNum = parseInt(mesStr, 10);
    const mesTexto = MESES_NOMBRES[mesNum - 1] || mesStr;
    const diaTexto = '1°';
    const anioTexto = anioStr;
    const textoCompleto = `el día 1° de ${mesTexto} de ${anioTexto} para recordar el pago correspondiente al mes de ${mesTexto} de ${anioTexto}`;
    return {
        proximoPeriodo,
        diaTexto,
        mesTexto,
        anioTexto,
        textoCompleto,
    };
}
