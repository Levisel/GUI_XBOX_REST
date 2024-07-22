function showSection(sectionId) {
    $('.content-section').hide();
    $('#' + sectionId).show();
}

var currentPlanes = [];
var currentPage = 1;
var rowsPerPage =20;

// Función para mostrar Planes paginados
function displayPlanes(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentPlanes.slice(startIndex, endIndex);
    $('#planList').empty();
    paginatedItems.forEach(function (plan) {
        $('#planList').append('<tr><td>'  + plan.Plan_Nombre + '</td><td>' + plan.Plan_Duracion  +'</td><td>'+ plan.Plan_Precio + '</td><td>' + plan.Plan_Plataforma + '</td><td>' +
            '<button class="btn btn-primary btn-sm" onclick="loadUpdateForm(\'' + plan.Plan_ID + '\')">Editar</button> ' +
            '<button class="btn btn-warning btn-sm" onclick="loadViewForm(\'' + plan.Plan_ID + '\')">Detalles</button> ' +
            '<button class="btn btn-danger btn-sm" onclick="loadDeleteForm(\'' + plan.Plan_ID + '\')">Eliminar</button>' +
            '</td></tr>');
    });
    
    setupPagination(currentPlanes.length, page);
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

    var startButton = '<li class="' + startClass + '"><a class="page-link" href="#" onclick="displayPlanes(1)">Inicio</a></li>';
    var endButton = '<li class="' + endClass + '"><a class="page-link" href="#" onclick="displayPlanes(' + totalPages + ')">Final</a></li>';

    $('#pagination').append('<ul class="pagination justify-content-center">');

    $('#pagination ul').append(startButton);

    for (var i = startPage; i <= endPage; i++) {
        var liClass = currentPage == i ? 'page-item active' : 'page-item';
        var pageItem = '<li class="' + liClass + '"><a class="page-link" href="#" onclick="displayPlanes(' + i + ')">' + i + '</a></li>';
        $('#pagination ul').append(pageItem);
    }

    $('#pagination ul').append(endButton);
}




// Función para obtener los Planes desde el servidor
function getPlanes() {
    $.ajax({
        url: 'https://localhost:8083/api/plan/Listar',
        type: 'GET',
        success: function (data) {
            console.log(data); // Añade esto para ver los datos en la consola
            currentPlanes = data;
            if (data.length) {
                displayPlanes(1);
                $('#errorMessage').hide();
            } else {
                $('#errorMessage').show().text('No hay Planes');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener Planes:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al obtener Planes: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function getPlanById() {
    var id = $('#searchId').val();
    if (!id) {
        getPlanes();
        return;
    }
    $.get('https://localhost:8083/api/plan/Listar/' + id, function (data) {
        currentPlanes = [data];
        displayPlanes(1);
        // Limpiar el valor del input
        $('#searchId').val("");
    }).fail(function () {
        $('#errorMessage').show().text('plan no encontrado.');
    });
}

function addPlan() {
    var nombre = $('#addNombre').val().trim();
    var duracion = $('#addDuracion').val().trim();
    var precio = $('#addPrecio').val().trim();
    var plataforma = $('#addPlataforma').val().trim();
    var logical_delete = $('#addLogicalDelete').val() === '0';

    if ( !nombre || !duracion || !precio || !plataforma || logical_delete === '') {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: "https://localhost:8083/api/plan/Insertar",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            Plan_Nombre: nombre,
            Plan_Duracion: duracion,
            Plan_Precio: precio,
            Plan_Plataforma: plataforma,
        }),
        success: function (data) {
             // Muestra la alerta de éxito
             var alertSuccess = $('<div class="alert alert-success position-fixed bottom-0 start-0" role="alert">¡Plan creado exitosamente!</div>');
             $('body').append(alertSuccess);
             alertSuccess.fadeIn();
 
             // Oculta la alerta después de 5 segundos
             setTimeout(function() {
                 alertSuccess.fadeOut(function() {
                     alertSuccess.remove();
                 });
             }, 3000);

            getPlanes();
            $('#addNombre').val('');
            $('#addDuracion').val('');
            $('#addPrecio').val('');
            $('#addPlataforma').val('');
            $('#addLogicalDelete').val('');
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al agregar plan:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al agregar plan: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function updatePlan() {
    var id = $('#updateId').val().trim();
    var nombre = $('#updateNombre').val().trim();
    var duracion = $('#updateDuracion').val().trim();
    var precio = $('#updatePrecio').val().trim();
    var plataforma = $('#updatePlataforma').val().trim();

    if (!id || !nombre || !duracion || !precio || !plataforma) {
        alert('Por favor, complete todos los campos');
        return;
    }

    if (isNaN(precio)) {
        alert('El precio deben ser numéricos');
        return;
    }

    $.ajax({
        url: "https://localhost:8083/api/plan/Actualizar",
        method: "PUT",
        data: JSON.stringify({
            Plan_ID: id,
            Plan_Nombre: nombre,
            Plan_Duracion: duracion,
            Plan_Precio: precio,
            Plan_Plataforma: plataforma,
        }),
        contentType: "application/json",
        success: function (result) {
            $('.alert').remove();
            var alertSuccess = $('<div class="alert alert-info position-fixed bottom-0 start-0" role="alert">¡Plan actualizado exitosamente!</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 4000);
            getPlanes();
            $('#updateId').val('');
            $('#updateNombre').val('');
            $('#updateDuracion').val('');
            $('#updatePrecio').val('');
            $('#updatePlataforma').val('');
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al actualizar plan:', xhr);
            var errorMessage = 'Error al actualizar plan: ' + xhr.status + ' ' + xhr.statusText;
            if (xhr.responseJSON && xhr.responseJSON.ExceptionMessage) {
                errorMessage += ' - ' + xhr.responseJSON.ExceptionMessage;
            }
            alert(errorMessage);
        }
    });
}


function deletePlan() {
    var id = $('#deleteId').val();
    if (!id) {
        alert('Por favor, proporcione un ID');
        return;
    }
    $.ajax({
        url: 'https://localhost:8083/api/plan/Eliminar/' + id,
        method: 'DELETE',
        contentType: "application/json",
        success: function (result) {
            // Muestra la alerta de éxito
            var alertSuccess = $('<div class="alert alert-warning position-fixed bottom-0 start-0" role="alert">El plan ha sido eliminado..</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();

            // Oculta la alerta después de 5 segundos
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 3000);
            getPlanes(); // Recargar lista de Planes
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al eliminar plan:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al eliminar plan: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}


function loadUpdateForm(id) {
    const plan = currentPlanes.find(p => p.Plan_ID == id);
    if (plan) {
        $('#updateId').val(plan.Plan_ID);
        $('#updateNombre').val(plan.Plan_Nombre);
        $('#updateDuracion').val(plan.Plan_Duracion);
        $('#updatePrecio').val(plan.Plan_Precio);
        $('#updatePlataforma').val(plan.Plan_Plataforma);
        showSection('update');
    }
}

function loadViewForm(id) {
    const plan = currentPlanes.find(p => p.Plan_ID == id);
    if (plan) {
        $('#viewId').val(plan.Plan_ID);
        $('#viewNombre').val(plan.Plan_Nombre);
        $('#viewDuracion').val(plan.Plan_Duracion);
        $('#viewPrecio').val(plan.Plan_Precio);
        $('#viewPlataforma').val(plan.Plan_Plataforma);
        showSection('view');
    }
}

function loadDeleteForm(id) {
    const plan = currentPlanes.find(p => p.Plan_ID == id);
    if (plan) {
        $('#deleteId').val(plan.Plan_ID);
        $('#deleteNombre').val(plan.Plan_Nombre);
        $('#deleteDuracion').val(plan.Plan_Duracion);
        showSection('delete');
    }
}

// Inicializar la visualización de Planes al cargar la página
$(document).ready(function() {
    getPlanes();
});
