import { Container } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad',
    description: 'Política de privacidad y protección de datos del Círculo Policial San José',
};

export default function PrivacidadPage() {
    return (
        <main className="section-padding">
            <Container>
                <h1 className="heading-primary mb-4">Política de Privacidad</h1>
                <p className="text-muted">Última actualización: Febrero 2026</p>

                <section className="my-5">
                    <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                        1. Información que Recopilamos
                    </h2>
                    <p>
                        El Círculo Policial "Gral. José Artigas" - San José recopila información personal cuando usted:
                    </p>
                    <ul>
                        <li>Completa el formulario de asociación</li>
                        <li>Envía una consulta a través del formulario de contacto</li>
                        <li>Navega por nuestro sitio web</li>
                    </ul>
                </section>

                <section className="my-5">
                    <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                        2. Uso de la Información
                    </h2>
                    <p>
                        Utilizamos su información personal para:
                    </p>
                    <ul>
                        <li>Procesar solicitudes de asociación</li>
                        <li>Responder a consultas</li>
                        <li>Enviar información sobre beneficios y actividades institucionales</li>
                        <li>Mejorar nuestros servicios</li>
                    </ul>
                </section>

                <section className="my-5">
                    <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                        3. Protección de Datos
                    </h2>
                    <p>
                        Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales
                        contra acceso no autorizado, pérdida o destrucción.
                    </p>
                </section>

                <section className="my-5">
                    <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                        4. Cookies
                    </h2>
                    <p>
                        Utilizamos cookies para mejorar su experiencia de navegación. Puede gestionar sus preferencias
                        de cookies a través del banner que aparece al visitar nuestro sitio.
                    </p>
                </section>

                <section className="my-5">
                    <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                        5. Sus Derechos
                    </h2>
                    <p>
                        Usted tiene derecho a:
                    </p>
                    <ul>
                        <li>Acceder a sus datos personales</li>
                        <li>Solicitar la rectificación de datos incorrectos</li>
                        <li>Solicitar la eliminación de sus datos</li>
                        <li>Oponerse al procesamiento de sus datos</li>
                    </ul>
                </section>

                <section className="my-5">
                    <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                        6. Contacto
                    </h2>
                    <p>
                        Para ejercer sus derechos o realizar consultas sobre privacidad, puede contactarnos a través
                        de nuestro <a href="/contacto" style={{ color: artiguistaColors.azul }}>formulario de contacto</a>.
                    </p>
                </section>
            </Container>
        </main>
    );
}
