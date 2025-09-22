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