# Guía para contribuir

¡Gracias por tu interés en contribuir a NotebookLM ↔ Zotero Sync! 

## 🚀 Primeros pasos

1. **Fork** el repositorio
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/TU-USUARIO/notebooklm-zotero-sync.git
   ```
3. **Crea una rama** para tu cambio:
   ```bash
   git checkout -b feature/mi-mejora
   ```

## 🔧 Desarrollo local

1. Abre `chrome://extensions/` en Chrome
2. Activa "Modo de desarrollador"
3. Clic en "Cargar descomprimida" y selecciona la carpeta del proyecto
4. Haz cambios en el código
5. Haz clic en el botón de recarga (🔄) en la extensión para ver los cambios

## 📝 Convenciones

### Commits
Usa mensajes descriptivos en español o inglés:
- `feat: añade soporte para formato AMA`
- `fix: corrige regex que afectaba IL-6`
- `docs: actualiza README con nuevas instrucciones`

### Código
- Usa `const` y `let`, nunca `var`
- Comenta las partes complejas
- Mantén funciones pequeñas y con un solo propósito

## 🐛 Reportar bugs

Abre un [issue](https://github.com/tu-usuario/notebooklm-zotero-sync/issues) con:
- Descripción del problema
- Pasos para reproducirlo
- Captura de pantalla (si aplica)
- Output de la consola (F12 → Console)

## 💡 Sugerir mejoras

¿Tienes una idea? ¡Genial! Abre un issue con la etiqueta `enhancement` y describe:
- Qué problema resuelve
- Cómo debería funcionar
- Mockups o ejemplos (si tienes)

## 🔀 Pull Requests

1. Asegúrate de que tu código funciona
2. Actualiza el README si añades funcionalidad
3. Describe qué hace tu PR y por qué
4. Referencia el issue relacionado (si existe)

## 🎯 Áreas donde necesitamos ayuda

- **Regex**: Mejorar la detección de citas sin afectar texto normal
- **UI/UX**: Hacer la interfaz más intuitiva
- **Tests**: Añadir pruebas automatizadas
- **Documentación**: Mejorar guías y ejemplos
- **Internacionalización**: Soporte para otros idiomas

## ❓ Preguntas

¿Dudas? Abre un issue con la etiqueta `question` o contacta al autor.

---

¡Gracias por contribuir! 🙏
