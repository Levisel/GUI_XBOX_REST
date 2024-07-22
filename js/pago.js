function showSection(sectionId) {
    $('.content-section').hide();
    $('#' + sectionId).show();
}

var currentPagos = [];
var currentClientes = [];
var currentSuscripciones = [];
var currentPage = 1;
var rowsPerPage = 10;

// Función para mostrar Pagos paginados
function displayPagos(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentPagos.slice(startIndex, endIndex);
    $('#pagoList').empty();
    
    paginatedItems.forEach(function (pago) {
        var Date = formatDate(pago.Pago_Fecha);
        var cliente = currentClientes.find(c => c.Cli_Cedula === pago.Cli_Cedula);
        var clienteName = cliente ? cliente.Cli_Nombre + ' ' + cliente.Cli_Apellido : 'Desconocido'; // Concatenar nombre y apellido
        
        $('#pagoList').append('<tr>' +
            '<td>' + pago.Pago_Codigo + '</td>' +
            '<td>' + clienteName + '</td>' +
            '<td>' + pago.Sus_ID + '</td>' +
            '<td>' + pago.Pago_Monto + '</td>' +
            '<td>' + Date + '</td>' +
            '<td>' + pago.Pago_Estado + '</td>' +
            '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="loadUpdateForm(\'' + pago.Pago_ID + '\')">Editar</button> ' +
                '<button class="btn btn-warning btn-sm" onclick="loadViewForm(\'' + pago.Pago_ID + '\')">Detalles</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="loadDeleteForm(\'' + pago.Pago_ID + '\')">Eliminar</button>' +
            '</td>' +
        '</tr>');
    });
    
    setupPagination(currentPagos.length, page);
}


// Función para formatear la fecha a MM/dd/yyyy
function formatDate(dateString) {
    var date = new Date(dateString);
    var day = date.getDate();
    var month = date.getMonth() + 1; // Los meses son 0-indexados
    var year = date.getFullYear();

    return (month < 10 ? '0' + month : month) + '/' + (day < 10 ? '0' + day : day) + '/' + year;
}

function formatDate2(date) {
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    
    // Asegurarse de que el mes y el día tengan dos dígitos
    if (month.length === 1) {
        month = '0' + month;
    }
    if (day.length === 1) {
        day = '0' + day;
    }
    
    return `${year}-${month}-${day}`;
}

function setupPagination(totalItems, currentPage) {
    var totalPages = Math.ceil(totalItems / rowsPerPage);
    var maxPagesToShow = 10; // Define el número máximo de páginas a mostrar

    $('#pagination').empty();

    var startPage, endPage;
    if (totalPages <= maxPagesToShow) {
        // Muestra todas las páginas si hay menos de `maxPagesToShow`
        startPage = 1;
        endPage = totalPages;
    } else {
        // Calcula el rango de páginas a mostrar alrededor de la página actual
        var halfPagesToShow = Math.floor(maxPagesToShow / 2);
        if (currentPage <= halfPagesToShow) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + halfPagesToShow >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - halfPagesToShow;
            endPage = currentPage + halfPagesToShow;
        }
    }

    // Agrega botones de navegación para "Inicio" y "Fin"
    var startClass = currentPage === 1 ? 'page-item disabled' : 'page-item';
    var endClass = currentPage === totalPages ? 'page-item disabled' : 'page-item';

    var startButton = '<li class="' + startClass + '"><a class="page-link" href="#" onclick="displayPagos(1)">Inicio</a></li>';
    var endButton = '<li class="' + endClass + '"><a class="page-link" href="#" onclick="displayPagos(' + totalPages + ')">Final</a></li>';

    $('#pagination').append('<ul class="pagination justify-content-center">');

    $('#pagination ul').append(startButton);

    for (var i = startPage; i <= endPage; i++) {
        var liClass = currentPage == i ? 'page-item active' : 'page-item';
        var pageItem = '<li class="' + liClass + '"><a class="page-link" href="#" onclick="displayPagos(' + i + ')">' + i + '</a></li>';
        $('#pagination ul').append(pageItem);
    }

    $('#pagination ul').append(endButton);
}



// Función para obtener los Pagos desde el servidor
function getPagos() {
    $.ajax({
        url: 'https://localhost:8083/api/pago/Listar',
        type: 'GET',
        success: function (data) {
            console.log(data); // Añade esto para ver los datos en la consola
            currentPagos = data;
            if (data.length) {
                displayPagos(1);
                $('#errorMessage').hide();
            } else {
                $('#errorMessage').show().text('No hay Pagos');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener Pagos:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al obtener Pagos: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function getPagoById() {
    var id = $('#searchId').val();
    if (!id) {
        getPagos();
        return;
    }
    $.get('https://localhost:8083/api/pago/Listar/' + id, function (data) {
        currentPagos = [data];
        displayPagos(1);
        $('#searchId').val("");

        // Salidas de depuración para verificar los datos de clientes y pagos
        console.log("Clientes cargados:", currentClientes);
        console.log("Pagos cargados:", currentPagos);
    }).fail(function () {
        $('#errorMessage').show().text('pago no encontrado.');
    });
}

function getClientes() {
    return new Promise(function(resolve, reject) {
        $.get('https://localhost:8083/api/cliente/Listar', function(data) {
            currentClientes = data;
            loadClienteSelectList(currentClientes, '#addClienteId');
            loadClienteSelectList(currentClientes, '#updateClienteId');
            resolve();
        }).fail(function(error) {
            reject(error);
        });
    });
}

function loadClienteSelectList(clientes, selectId) {
    $(selectId).empty();
    var addedClienteNames = [];
    clientes.forEach(function (cliente) {
        var clienteFullName = cliente.Cli_Nombre + ' ' + cliente.Cli_Apellido;
        if (!addedClienteNames.includes(clienteFullName)) {
            $(selectId).append('<option value="' + cliente.Cli_Cedula + '">' + clienteFullName + '</option>');
            addedClienteNames.push(clienteFullName);
        }
    });
}

// Función para obtener las suscripciones desde el servidor y cargarlas en el selector updateSuscripcionId
function getSuscripciones() {
    $.ajax({
        url: 'https://localhost:8083/api/suscripcion/Listar',
        type: 'GET',
        success: function (data) {
            currentSuscripciones = data;
            loadSuscripcionSelectList(currentSuscripciones, '#addSuscripcionId');
            loadSuscripcionSelectList(currentSuscripciones, '#updateSuscripcionId');
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener suscripciones:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al obtener suscripciones: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

// Función para cargar las suscripciones en el selector updateSuscripcionId
function loadSuscripcionSelectList(suscripciones, selectId) {
    $(selectId).empty();
    suscripciones.forEach(function (suscripcion) {
        $(selectId).append('<option value="' + suscripcion.Sus_ID + '">' + suscripcion.Sus_ID + '</option>');
    });
}



function addPago() {
    var cliente = $('#addClienteId').val();
    var suscripcion = $('#addSuscripcionId').val().trim();
    var monto = $('#addMonto').val().trim();
    var fecha = $('#addFecha').val().trim();
    var estado = $('#addEstado').val().trim();

    $.ajax({
        url: "https://localhost:8083/api/pago/Insertar",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            Sus_ID: suscripcion,
            Cli_Cedula: cliente,
            Pago_Monto: monto,
            Pago_Fecha: fecha,
            Pago_Estado: estado,
        }),
        success: function (data) {
             // Muestra la alerta de éxito
             var alertSuccess = $('<div class="alert alert-success position-fixed bottom-0 start-0" role="alert">¡Pago creado exitosamente!</div>');
             $('body').append(alertSuccess);
             alertSuccess.fadeIn();
 
             // Oculta la alerta después de 5 segundos
             setTimeout(function() {
                 alertSuccess.fadeOut(function() {
                     alertSuccess.remove();
                 });
             }, 3000);

            getPagos();
            $('#addClienteId').val('');
            $('#addSuscripcionId').val('');
            $('#addMonto').val('');
            $('#addFecha').val('');
            $('#addEstado').val('');

            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al agregar pago:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al agregar pago: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function updatePago() {

    var id = $('#updateId').val();
    var cliente = $('#updateClienteId').val().trim();
    var suscripcion = $('#updateSuscripcionId').val().trim();
    var monto = $('#updateMonto').val().trim();
    var fecha = $('#updateFecha').val().trim();
    var estado = $('#updateEstado').val();


    $.ajax({
        url: "https://localhost:8083/api/pago/Actualizar",
        method: "PUT",
        data: JSON.stringify({
            Pago_ID: id,
            Sus_ID: suscripcion,
            Cli_Cedula: cliente,
            Pago_Monto: monto,
            Pago_Fecha: fecha,
            Pago_Estado: estado,
        }),
        contentType: "application/json",
        success: function (result) {
            $('.alert').remove();
            var alertSuccess = $('<div class="alert alert-info position-fixed bottom-0 start-0" role="alert">¡Pago actualizado exitosamente!</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 4000);
            getPagos();
            $('#updateId').val('');
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al actualizar pago:', xhr);
            var errorMessage = 'Error al actualizar pago: ' + xhr.status + ' ' + xhr.statusText;
            if (xhr.responseJSON && xhr.responseJSON.ExceptionMessage) {
                errorMessage += ' - ' + xhr.responseJSON.ExceptionMessage;
            }
            alert(errorMessage);
        }
    });
}


function deletePago() {
    var id = $('#deleteId').val();
    if (!id) {
        alert('Por favor, proporcione un ID');
        return;
    }
    $.ajax({
        url: 'https://localhost:8083/api/pago/Eliminar/' + id,
        method: 'DELETE',
        contentType: "application/json",
        success: function (result) {
            // Muestra la alerta de éxito
            var alertSuccess = $('<div class="alert alert-warning position-fixed bottom-0 start-0" role="alert">El pago ha sido eliminado..</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();

            // Oculta la alerta después de 5 segundos
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 3000);
            getPagos(); // Recargar lista de Pagos
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al eliminar pago:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al eliminar pago: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

// Dentro de la función loadUpdateForm(id)
function loadUpdateForm(id) {
    const pago = currentPagos.find(p => p.Pago_ID == id);
    if (pago) {
        $('#updateId').val(pago.Pago_ID);
        $('#updateClienteId').val(pago.Cli_Cedula);
        $('#updateSuscripcionId').val(pago.Sus_ID); 
        $('#updateMonto').val(pago.Pago_Monto);
        $('#updateFecha').val(formatDate2(new Date(pago.Pago_Fecha)));
        $('#updateEstado').val(pago.Pago_Estado === 'Pendiente' ? 'Pendiente' : 'Pagado');
        $('#updateCodigo').val(pago.Pago_Codigo); // Agrega esta línea para mostrar el código del pago
        showSection('update');
    }
}

function loadViewForm(id) {
    const pago = currentPagos.find(p => p.Pago_ID == id);
    if (pago) {
        $('#viewClienteId').val(pago.Cli_Cedula);
        $('#viewSuscripcionId').val(pago.Sus_ID); 
        $('#viewMonto').val(pago.Pago_Monto);
        $('#viewFecha').val(formatDate2(new Date(pago.Pago_Fecha)));
        $('#viewEstado').val(pago.Pago_Estado === 'Pendiente' ? 'Pendiente' : 'Pagado');
        $('#viewCodigo').val(pago.Pago_Codigo); // Agrega esta línea para mostrar el código del pago
        showSection('view');
    }
}

function loadDeleteForm(id) {
    const pago = currentPagos.find(p => p.Pago_ID == id);
    if (pago) {
        $('#deleteId').val(pago.Pago_ID);
        $('#deleteClienteId').val(pago.Cli_Cedula);
        $('#deleteSuscripcionId').val(pago.Sus_ID);
        $('#deleteCodigo').val(pago.Pago_Codigo);
        $('#deleteFecha').val(formatDate(pago.Pago_Fecha));

        showSection('delete');
    }
}

// Inicializar la visualización de Pagos al cargar la página
$(document).ready(function() {
    getClientes().then(getPagos).catch(function(error) {
        console.error('Error al cargar los clientes:', error);
        alert('Error al cargar los clientes.');
    });
    getSuscripciones();
});