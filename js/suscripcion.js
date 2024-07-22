function showSection(sectionId) {
    $('.content-section').hide();
    $('#' + sectionId).show();
}

var currentSuscripciones = [];
var currentPlanes = [];
var currentPage = 1;
var rowsPerPage = 20;

// Función para mostrar Suscripciones paginados
function displaySuscripciones(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentSuscripciones.slice(startIndex, endIndex);
    $('#suscripcionList').empty();
    
    paginatedItems.forEach(function (suscripcion) {
        var DateStart = formatDate(suscripcion.Sus_StartDate);
        var DateEnd = formatDate(suscripcion.Sus_EndDate);
        var plan = currentPlanes.find(p => p.Plan_ID === suscripcion.Plan_ID);
        var planName = plan ? plan.Plan_Nombre : 'Desconocido'; // Aquí obtenemos el nombre del plan en lugar del ID
        var estadoRenovacion = suscripcion.Sus_RenovacionAuto ?? false;
        var buttonClass = estadoRenovacion ? "btn btn-success" : "btn btn-danger";
        var buttonText = estadoRenovacion ? "Sí" : "No";
        
        $('#suscripcionList').append('<tr>' +
            '<td>' + planName + '</td>' +
            '<td>' + DateStart + '</td>' +
            '<td>' + DateEnd + '</td>' +
            '<td>' + suscripcion.Sus_Estado + '</td>' +
            '<td><button type="button" class="' + buttonClass + '" disabled>' + buttonText + '</button></td>' +
            '<td>' +
                '<button class="btn btn-primary btn-sm" onclick="loadUpdateForm(\'' + suscripcion.Sus_ID + '\')">Editar</button> ' +
                '<button class="btn btn-warning btn-sm" onclick="loadViewForm(\'' + suscripcion.Sus_ID + '\')">Detalles</button> ' +
                '<button class="btn btn-danger btn-sm" onclick="loadDeleteForm(\'' + suscripcion.Sus_ID + '\')">Eliminar</button>' +
            '</td>' +
        '</tr>');
    });
    
    setupPagination(currentSuscripciones.length, page);
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

    var startButton = '<li class="' + startClass + '"><a class="page-link" href="#" onclick="displaySuscripciones(1)">Inicio</a></li>';
    var endButton = '<li class="' + endClass + '"><a class="page-link" href="#" onclick="displaySuscripciones(' + totalPages + ')">Final</a></li>';

    $('#pagination').append('<ul class="pagination justify-content-center">');

    $('#pagination ul').append(startButton);

    for (var i = startPage; i <= endPage; i++) {
        var liClass = currentPage == i ? 'page-item active' : 'page-item';
        var pageItem = '<li class="' + liClass + '"><a class="page-link" href="#" onclick="displaySuscripciones(' + i + ')">' + i + '</a></li>';
        $('#pagination ul').append(pageItem);
    }

    $('#pagination ul').append(endButton);
}




// Función para obtener los Suscripciones desde el servidor
function getSuscripciones() {
    $.ajax({
        url: 'https://localhost:8083/api/suscripcion/Listar',
        type: 'GET',
        success: function (data) {
            console.log(data); // Añade esto para ver los datos en la consola
            currentSuscripciones = data;
            if (data.length) {
                displaySuscripciones(1);
                $('#errorMessage').hide();
            } else {
                $('#errorMessage').show().text('No hay Suscripciones');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener Suscripciones:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al obtener Suscripciones: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function getPlanes() {
    $.get('https://localhost:8083/api/plan/Listar', function (data) {
        currentPlanes = data;
        loadPlanSelectList(currentPlanes, '#addPlanId');
        loadPlanSelectList(currentPlanes, '#updatePlanId');
    }).fail(function () {
        alert('Error al obtener Planes.');
    });
}

function loadPlanSelectList(planes, selectId) {
    $(selectId).empty();
    var addedPlanNames = [];
    planes.forEach(function (plan) {
        if (!addedPlanNames.includes(plan.Plan_Nombre)) {
            $(selectId).append('<option value="' + plan.Plan_ID + '">' + plan.Plan_Nombre + '</option>');
            addedPlanNames.push(plan.Plan_Nombre);
        }
    });
}



function getSuscripcionById() {
    var id = $('#searchId').val();
    if (!id) {
        getSuscripciones();
        return;
    }
    $.get('https://localhost:8083/api/suscripcion/Listar/' + id, function (data) {
        currentSuscripciones = [data];
        displaySuscripciones(1);
        // Limpiar el valor del input
        $('#searchId').val("");
    }).fail(function () {
        $('#errorMessage').show().text('suscripcion no encontrado.');
    });
}

function addSuscripcion() {
    var id = $('#addId').val().trim();
    var plan = $('#addPlanId').val();
    var start_date = $('#addStartDate').val().trim();
    var end_date = $('#addEndDate').val().trim();
    var estado = $('#addEstado').val();
    var renovacion= $('#addRenovacionAuto').val().trim() === '1';


    $.ajax({
        url: "https://localhost:8083/api/suscripcion/Insertar",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            Sus_ID: id,
            Plan_ID: plan,
            Sus_StartDate: start_date,
            Sus_EndDate: end_date,
            Sus_Estado: estado,
            Sus_RenovacionAuto: renovacion,
        }),
        success: function (data) {
             // Muestra la alerta de éxito
             var alertSuccess = $('<div class="alert alert-success position-fixed bottom-0 start-0" role="alert">¡Suscripción creada exitosamente!</div>');
             $('body').append(alertSuccess);
             alertSuccess.fadeIn();
 
             // Oculta la alerta después de 5 segundos
             setTimeout(function() {
                 alertSuccess.fadeOut(function() {
                     alertSuccess.remove();
                 });
             }, 3000);

            getSuscripciones();
            $('#addId').val('');
            $('#addPlanId').val('');
            $('#addStartDate').val('');
            $('#addEndDate').val('');
            $('#addEstado').val('');
            $('#addRenovacionAuto').val('');
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al agregar suscripcion:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al agregar suscripcion: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function updateSuscripcion() {
    var id = $('#updateId').val().trim();
    var plan = $('#updatePlanId').val().trim();
    var start_date = $('#updateStartDate').val().trim();
    var end_date = $('#updateEndDate').val().trim();
    var estado = $('#updateEstado').val();
    var renovacion= $('#updateRenovacionAuto').val().trim() === '1';

    $.ajax({
        url: "https://localhost:8083/api/suscripcion/Actualizar",
        method: "PUT",
        data: JSON.stringify({
            Sus_ID: id,
            Plan_ID: plan,
            Sus_StartDate: start_date,
            Sus_EndDate: end_date,
            Sus_Estado: estado,  // Mantener como cadena
            Sus_RenovacionAuto: renovacion,  // Mantener como cadena
        }),
        contentType: "application/json",
        success: function (result) {
            $('.alert').remove();
            var alertSuccess = $('<div class="alert alert-info position-fixed bottom-0 start-0" role="alert">¡Suscripción actualizada exitosamente!</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 4000);
            getSuscripciones();
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al actualizar suscripcion:', xhr);
            var errorMessage = 'Error al actualizar suscripcion: ' + xhr.status + ' ' + xhr.statusText;
            if (xhr.responseJSON && xhr.responseJSON.ExceptionMessage) {
                errorMessage += ' - ' + xhr.responseJSON.ExceptionMessage;
            }
            alert(errorMessage);
        }
    });
}


function deleteSuscripcion() {
    var id = $('#deleteId').val();
    if (!id) {
        alert('Por favor, proporcione un ID');
        return;
    }
    $.ajax({
        url: 'https://localhost:8083/api/suscripcion/Eliminar/' + id,
        method: 'DELETE',
        contentType: "application/json",
        success: function (result) {
            // Muestra la alerta de éxito
            var alertSuccess = $('<div class="alert alert-warning position-fixed bottom-0 start-0" role="alert">La suscripción ha sido eliminada..</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();

            // Oculta la alerta después de 5 segundos
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 3000);
            getSuscripciones(); // Recargar lista de Suscripciones
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al eliminar suscripcion:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al eliminar suscripcion: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}


function loadUpdateForm(id) {
    const suscripcion = currentSuscripciones.find(p => p.Sus_ID === id);
    if (suscripcion) {
        $('#updateId').val(suscripcion.Sus_ID);
        $('#updatePlanId').val(suscripcion.Plan_ID);
        $('#updateStartDate').val(formatDate2(new Date(suscripcion.Sus_StartDate)));
        $('#updateEndDate').val(formatDate2(new Date(suscripcion.Sus_EndDate)));
        $('#updateEstado').val(suscripcion.Sus_Estado === 'Activo' ? 'Activo' : 'Inactivo');
        $('#updateRenovacionAuto').val(suscripcion.Sus_RenovacionAuto ? '1' : '0');
        showSection('update');
    }
}

function loadViewForm(id) {
    const suscripcion = currentSuscripciones.find(p => p.Sus_ID === id);
    if (suscripcion) {
        $('#viewId').val(suscripcion.Sus_ID);
        $('#viewPlan').val(suscripcion.Plan_ID);
        $('#viewStartDate').val(formatDate(suscripcion.Sus_StartDate));
        $('#viewEndDate').val(formatDate(suscripcion.Sus_EndDate));
        $('#viewEstado').val(suscripcion.Sus_Estado);
        $('#viewRenovacionAuto').val(suscripcion.Sus_RenovacionAuto ? 'Sí' : 'No');
        showSection('view');
    }
}

function loadDeleteForm(id) {
    const suscripcion = currentSuscripciones.find(p => p.Sus_ID === id);
    if (suscripcion) {
        $('#deleteId').val(suscripcion.Sus_ID);
        $('#deletePlan').val(suscripcion.Plan_ID);
        $('#deleteStartDate').val(formatDate(suscripcion.Sus_StartDate));
        $('#deleteEndDate').val(formatDate(suscripcion.Sus_EndDate));
        showSection('delete');
    }
}

// Inicializar la visualización de Suscripciones al cargar la página
$(document).ready(function() {
    getSuscripciones();
    getPlanes(); // Agregar esta línea para cargar los planes al cargar la página
});
