# TieBreaker ⚖️

Un **juez** que ayuda a cortar empates y tomar decisiones: le das las opciones en juego y te devuelve un veredicto con el razonamiento a la vista, para no quedarte dando vueltas entre dos caminos parecidos.

Herramienta creada durante el **curso de creación de apps con IA de Google** — experiencia de uso directa, sin backend propio.

## Qué hace

- Recibe las opciones (y el contexto que importa de cada una).
- Compara y emite un veredicto con justificación, no solo un número.
- Sirve para decisiones técnicas y para las que no lo son tanto.

## Stack

`TypeScript` · `Vite` · app web con `server.ts` (proxy de la API del modelo).

## Correr en local

```bash
bun install
cp .env.example .env    # cargar la API key del proveedor
bun run dev
```

## Estado

Prototipo funcional del curso. Sin garantías de producción: la idea es que decidir sea explícito y rápido.
