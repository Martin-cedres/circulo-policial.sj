import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Container } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos de Uso',
    description: 'Términos y condiciones de uso del sitio web del Círculo Policial San José',
};

export default function TerminosPage() {
    return (
        <>
            <Header />
            <main className="section-padding">
                <Container>
                    <h1 className="heading-primary mb-4">Términos de Uso</h1>
                    <p className="text-muted">Última actualización: Febrero 2026</p>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            1. Aceptación de los Términos
                        </h2>
                        <p>
                            Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos de Uso y
                            a todas las leyes y regulaciones aplicables de la República Oriental del Uruguay.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            2. Uso del Sitio
                        </h2>
                        <p>
                            Este sitio web es proporcionado por el Círculo Policial "Gral. José Artigas" - San José
                            exclusivamente para fines informativos y de comunicación institucional.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            3. Propiedad Intelectual
                        </h2>
                        <p>
                            Todo el contenido de este sitio, incluyendo textos, imágenes, logotipos y diseño, es propiedad
                            del Círculo Policial San José y está protegido por las leyes de propiedad intelectual.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            4. Limitación de Responsabilidad
                        </h2>
                        <p>
                            El Círculo Policial San José no se hace responsable de errores u omisiones en el contenido
                            de este sitio web. La información se proporciona "tal cual" sin garantías de ningún tipo.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            5. Enlaces Externos
                        </h2>
                        <p>
                            Este sitio puede contener enlaces a sitios web de terceros. No somos responsables del
                            contenido o las prácticas de privacidad de estos sitios externos.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            6. Modificaciones
                        </h2>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones
                            entrarán en vigor inmediatamente después de su publicación en este sitio.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            7. Neutralidad Institucional
                        </h2>
                        <p>
                            El Círculo Policial "Gral. José Artigas" - San José mantiene una estricta neutralidad
                            política, racial, filosófica y religiosa. Cualquier contenido compartido en este sitio
                            refleja esta posición institucional.
                        </p>
                    </section>

                    <section className="my-5">
                        <h2 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                            8. Contacto
                        </h2>
                        <p>
                            Para consultas sobre estos términos, puede contactarnos a través de nuestro{' '}
                            <a href="/contacto" style={{ color: artiguistaColors.azul }}>formulario de contacto</a>.
                        </p>
                    </section>
                </Container>
            </main>
            <Footer />
        </>
    );
}
