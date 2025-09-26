/*
===============================================================================
Sistema de Biblioteca - Lógica de Frontend
-------------------------------------------------------------------------------
Este archivo implementa:
- Validación del formulario de solicitud de préstamo usando validaciones nativas
  del navegador y reglas personalizadas.
- Restricciones de fechas (no permitir devoluciones anteriores al préstamo).
- Persistencia básica de los préstamos en localStorage para facilitar pruebas.
- Mensajería de éxito en la UI y logging estructurado en consola.

Estructura del archivo:
1) Arranque seguro al cargar el DOM
2) Referencias a elementos del formulario
3) Helpers (fechas y utilidades)
4) Validaciones personalizadas (ID y orden de fechas)
5) Persistencia (leer/escribir en localStorage)
6) Logging (consola tabular)
7) Reglas iniciales y listeners reactivos
8) Manejo del submit del formulario

Notas:
- Este archivo está aislado en un IIFE para no contaminar el scope global.
- Si se modifica el id de los elementos en HTML, actualizar las referencias aquí.
===============================================================================
*/

(function () {
    'use strict';

    // 1) Arranque seguro: se ejecuta cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', () => {
        // 2) Referencias a elementos del formulario
        const form = document.getElementById('loan-form');
        if (!form) return; // Si no existe el formulario, no hacer nada

        const nameInput = document.getElementById('student-name');
        const idInput = document.getElementById('student-id');
        const bookSelect = document.getElementById('book');
        const loanDateInput = document.getElementById('loan-date');
        const returnDateInput = document.getElementById('return-date');
        const successAlert = document.getElementById('form-success');

        // 3) Helpers
        // - Devuelve la fecha actual en formato ISO (yyyy-mm-dd) para inputs tipo date
        const todayISO = () => new Date().toISOString().slice(0, 10);

        // - Configura los mínimos de fechas en los inputs según reglas del negocio
        function setMinDates() {
            const today = todayISO();
            if (loanDateInput) loanDateInput.min = today;
            // Si hay fecha de préstamo, la devolución mínima es ese día o posterior
            const minReturn = loanDateInput && loanDateInput.value ? loanDateInput.value : today;
            if (returnDateInput) returnDateInput.min = minReturn;
        }

        // 4) Validaciones personalizadas
        // - Asegura que la fecha de devolución no sea anterior a la de préstamo
        function validateDateOrder() {
            if (!loanDateInput || !returnDateInput) return;
            const loan = loanDateInput.value;
            const ret = returnDateInput.value;
            // Limpiar mensaje previo (si lo hubiera)
            returnDateInput.setCustomValidity('');
            if (loan && ret && ret < loan) {
                returnDateInput.setCustomValidity('La fecha de devolución no puede ser anterior a la fecha de préstamo.');
            }
        }

        // - Valida el formato del ID de estudiante: 4-20 caracteres alfanuméricos o . _ -
        function validateStudentId() {
            if (!idInput) return;
            const re = /^[A-Za-z0-9_.-]{4,20}$/; // regla de validación
            idInput.setCustomValidity('');
            if (idInput.value && !re.test(idInput.value.trim())) {
                idInput.setCustomValidity('El ID debe tener 4-20 caracteres alfanuméricos (puede incluir . _ -).');
            }
        }

        // 5) Persistencia (localStorage)
        // - Obtiene info del libro seleccionado (id/título) desde el select
        function getSelectedBookInfo() {
            if (!bookSelect) return { id: '', titulo: '' };
            const id = bookSelect.value;
            const titulo = bookSelect.options[bookSelect.selectedIndex]?.text || '';
            return { id, titulo };
        }

        // - Normaliza un préstamo a una fila legible para console.table
        function flattenLoanRow(data) {
            return {
                Nombre: data.estudiante.nombre,
                ID: data.estudiante.id,
                Libro: data.libro.titulo,
                LibroID: data.libro.id,
                Prestamo: data.fechas.prestamo,
                Devolucion: data.fechas.devolucion,
                CreadoISO: data.timestamp
            };
        }

        // - Lee lista de préstamos guardados, o devuelve [] si no existe
        function readLoans() {
            try {
                const raw = localStorage.getItem('prestamos');
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                // Si localStorage falla (modo privado o error), devolver arreglo temporal
                return [];
            }
        }

        // - Escribe lista de préstamos a localStorage (silencia errores de cuota)
        function writeLoans(list) {
            try {
                localStorage.setItem('prestamos', JSON.stringify(list));
            } catch (e) {
                // Silenciar errores de almacenamiento para no romper la UX
            }
        }

        // 6) Logging (agrupa y muestra tabla consolidada)
        function logLoan(data) {
            try {
                console.groupCollapsed(`Préstamo registrado • ${data.estudiante.nombre} • ${data.libro.titulo}`);
                console.log('Detalle del préstamo:', data);
                const all = readLoans();
                const rows = all.map(flattenLoanRow);
                console.table(rows);
                console.groupEnd();
            } catch (e) {
                // Previene que un error en consola afecte el flujo
            }
        }

        // 7) Reglas iniciales y listeners reactivos
        setMinDates(); // Establecer mínimos al iniciar

        // Recalcular mínimos y validar orden de fechas cuando cambien
        loanDateInput?.addEventListener('input', () => {
            setMinDates();
            validateDateOrder();
        });
        returnDateInput?.addEventListener('input', validateDateOrder);

        // Validación de ID en tiempo real
        idInput?.addEventListener('input', validateStudentId);

        // 8) Manejo del submit del formulario
        form.addEventListener('submit', function (event) {
            // Validaciones personalizadas antes del checkValidity nativo
            validateStudentId();
            validateDateOrder();

            if (!form.checkValidity()) {
                // Si hay errores nativos o personalizados, evitar envío y marcar el form
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Evita envío real (no hay backend en este demo)
            event.preventDefault();

            // Construye el objeto de datos estructurado
            const payload = {
                estudiante: {
                    nombre: nameInput?.value.trim() || '',
                    id: idInput?.value.trim() || ''
                },
                libro: getSelectedBookInfo(),
                fechas: {
                    prestamo: loanDateInput?.value || '',
                    devolucion: returnDateInput?.value || ''
                },
                timestamp: new Date().toISOString()
            };

            // Persistencia básica en localStorage
            const allLoans = readLoans();
            allLoans.push(payload);
            writeLoans(allLoans);

            // Logging en consola (colapsado y en tabla)
            logLoan(payload);

            // UX de éxito: mostrar alerta y ocultarla después de 5s
            if (successAlert) {
                successAlert.style.display = 'block';
                setTimeout(() => { successAlert.style.display = 'none'; }, 5000);
            }

            // Resetear formulario y estado de validación
            form.reset();
            form.classList.remove('was-validated');
            setMinDates(); // Reaplicar mínimos tras reset
        }, false);
    });
})();
