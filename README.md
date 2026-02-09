# Círculo Policial "Gral. José Artigas" - San José

Sitio web oficial del Círculo Policial de San José, Uruguay. Fundado el 15 de abril de 1944, celebrando su **82º Aniversario en 2026**.

## 🎯 Características

- ✅ **Next.js 15** con App Router y TypeScript
- ✅ **SEO Optimizado**: Metadatos completos, Open Graph, Twitter Cards, JSON-LD schemas
- ✅ **Diseño Artiguista**: Paleta de colores extraída del escudo oficial
- ✅ **Responsive**: Totalmente adaptado a móviles, tablets y desktop
- ✅ **Seguridad SGSI**: Headers de seguridad implementados
- ✅ **GDPR**: Banner de cookies con consentimiento
- ✅ **Core Web Vitals**: Optimizado para LCP, CLS y FID
- ✅ **Panel Admin**: Gestión básica de contenido (requiere implementación de BD)

## 📦 Tecnologías

- **Framework**: Next.js 15.1
- **Lenguaje**: TypeScript
- **UI**: Reactstrap + Bootstrap 5.3
- **Tipografías**: Mulish (principal), Satisfy (decorativa)
- **Optimización de imágenes**: next/image con WebP/AVIF
- **Validación**: react-hook-form + zod

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn

### Instalación

```bash
# 1. Navegar al directorio del proyecto
cd circulo-policial

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en **http://localhost:3000**

## 📝 Páginas Creadas

### Páginas Públicas
- ✅ **Inicio** (`/`) - Hero, 82 aniversario, nosotros, beneficios, CTA
- ✅ **Nosotros** (`/nosotros`) - Historia, misión, valores, liderazgo
- ✅ **Beneficios** (`/beneficios`) - Detalle de todos los servicios
- ✅ **Asociarse** (`/asociarse`) - Formulario de inscripción
- ✅ **Contacto** (`/contacto`) - Formulario de contacto general
- ✅ **Galería** (`/galeria`) - Fotos institucionales
- ✅ **Privacidad** (`/privacidad`) - Política de privacidad
- ✅ **Términos** (`/terminos`) - Términos de uso

### Panel Administrativo
- ✅ **Login** (`/admin`) - Autenticación
- ✅ **Dashboard** (`/admin/dashboard`) - Estadísticas y accesos rápidos

## 🔐 Panel Administrativo

**URL**: http://localhost:3000/admin  
**Usuario**: `admin`  
**Contraseña**: `circulopolicial2026`

⚠️ **IMPORTANTE**: Cambiar credenciales en producción mediante variables de entorno.

## 📸 Reemplazar Imágenes Placeholder

Las imágenes actuales son placeholders SVG. Reemplaza con fotos reales en `public/images/`:
- `escudo-oficial.png` - Logo institucional (mínimo 1000px)
- `fachada-ituzaingo.jpg` - Fachada de la sede
- `salon-chico.jpg` - Salón social acondicionado
- `cabanas-ordeig.jpg` - Cabañas en balneario
- `hogar-estudiantil.jpg` - Edificio del hogar estudiantil

## 🌐 Deployment a Vercel

```bash
# Verificar build
npm run build

# Deploy
vercel
```

Variables de entorno en Vercel:
```
NEXT_PUBLIC_SITE_URL=https://www.circulopolicialsj.org.uy
ADMIN_USERNAME=admin_produccion
ADMIN_PASSWORD=contraseña_segura_aqui
```

## 📄 Licencia

© 2026 Círculo Policial "Gral. José Artigas" - San José. Todos los derechos reservados.

---

**Desarrollado con ❤️ para la familia policial de San José**
