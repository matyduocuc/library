<<<<<<< HEAD
// Validación y registro estructurado de solicitudes de préstamo
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('loan-form');
        if (!form) return; // Si no existe el formulario, no hacer nada

        const nameInput = document.getElementById('student-name');
        const idInput = document.getElementById('student-id');
        const bookSelect = document.getElementById('book');
        const loanDateInput = document.getElementById('loan-date');
        const returnDateInput = document.getElementById('return-date');
        const successAlert = document.getElementById('form-success');

        // Ayudantes
        const todayISO = () => new Date().toISOString().slice(0, 10); // yyyy-mm-dd

        function setMinDates() {
            const today = todayISO();
            if (loanDateInput) loanDateInput.min = today;
            // Si hay fecha de préstamo, devolución mínima es ese día o posterior
            const minReturn = loanDateInput && loanDateInput.value ? loanDateInput.value : today;
            if (returnDateInput) returnDateInput.min = minReturn;
        }

        function validateDateOrder() {
            if (!loanDateInput || !returnDateInput) return;
            const loan = loanDateInput.value;
            const ret = returnDateInput.value;
            // Limpiar estado previo
            returnDateInput.setCustomValidity('');
            if (loan && ret && ret < loan) {
                returnDateInput.setCustomValidity('La fecha de devolución no puede ser anterior a la fecha de préstamo.');
            }
        }

        function validateStudentId() {
            if (!idInput) return;
            // Permite letras, números y - _ . con longitud 4-20
            const re = /^[A-Za-z0-9_.-]{4,20}$/;
            idInput.setCustomValidity('');
            if (idInput.value && !re.test(idInput.value.trim())) {
                idInput.setCustomValidity('El ID debe tener 4-20 caracteres alfanuméricos (puede incluir . _ -).');
            }
        }

        function getSelectedBookInfo() {
            if (!bookSelect) return { id: '', titulo: '' };
            const id = bookSelect.value;
            const titulo = bookSelect.options[bookSelect.selectedIndex]?.text || '';
            return { id, titulo };
        }

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

        function readLoans() {
            try {
                const raw = localStorage.getItem('prestamos');
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                // Si localStorage falla, devolver arreglo temporal
                return [];
            }
        }

        function writeLoans(list) {
            try {
                localStorage.setItem('prestamos', JSON.stringify(list));
            } catch (e) {
                // Silenciar errores de almacenamiento para no romper la UX
            }
        }

        function logLoan(data) {
            try {
                // Registro agrupado y tabular para mayor claridad en consola
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

        // Reglas iniciales
        setMinDates();

        // Reactividad básica de validación
        loanDateInput?.addEventListener('input', () => {
            setMinDates();
            validateDateOrder();
        });
        returnDateInput?.addEventListener('input', validateDateOrder);
        idInput?.addEventListener('input', validateStudentId);

        form.addEventListener('submit', function (event) {
            // Validaciones personalizadas antes del checkValidity nativo
            validateStudentId();
            validateDateOrder();

            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Evita envío real (no hay backend)
            event.preventDefault();

            // Construcción de payload estructurado
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

            // Persistencia básica en localStorage para poder mostrar tabla consolidada en consola
            const allLoans = readLoans();
            allLoans.push(payload);
            writeLoans(allLoans);

            // Log robusto en consola
            logLoan(payload);

            // UX de éxito
            if (successAlert) {
                successAlert.style.display = 'block';
                setTimeout(() => { successAlert.style.display = 'none'; }, 5000);
            }

            form.reset();
            form.classList.remove('was-validated');
            setMinDates(); // Reaplicar mínimos tras reset
        }, false);
    });
})();
=======
// Validación de formulario con Bootstrap
(function () {
    'use strict'
    
    // Obtener el formulario al que queremos aplicar estilos de validación de Bootstrap
    var form = document.getElementById('loan-form')
    
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
        } else {
            event.preventDefault()
            // Mostrar mensaje de éxito
            document.getElementById('form-success').style.display = 'block'
            form.reset()
            form.classList.remove('was-validated')
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                document.getElementById('form-success').style.display = 'none'
            }, 5000)
        }
        
        form.classList.add('was-validated')
    }, false)
})()
>>>>>>> cf8f1de3d17180c5d9a42a2115a3a5801e1bb5b0
