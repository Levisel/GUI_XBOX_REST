function showSection(sectionId) {
    $('.content-section').hide();
    $('#' + sectionId).show();
}

var currentClientes = [];
var currentPage = 1;
var rowsPerPage =20;

// Función para mostrar clientes paginados
function displayClientes(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var paginatedItems = currentClientes.slice(startIndex, endIndex);
    $('#clienteList').empty();
    paginatedItems.forEach(function (cliente) {
        var Date = formatDate(cliente.Cli_BirthDate);
        $('#clienteList').append('<tr><td>' + cliente.Cli_Cedula + '</td><td>' + cliente.Cli_Nombre + '</td><td>' + cliente.Cli_Apellido + '</td><td>' + Date + '</td><td>' + cliente.Cli_Pais + '</td><td>' + (cliente.Cli_Email) + '</td><td>' +
            '<button class="btn btn-primary btn-sm" onclick="loadUpdateForm(\'' + cliente.Cli_Cedula + '\')">Editar</button> ' +
            '<button class="btn btn-warning btn-sm" onclick="loadViewForm(\'' + cliente.Cli_Cedula + '\')">Detalles</button> ' +
            '<button class="btn btn-danger btn-sm" onclick="loadDeleteForm(\'' + cliente.Cli_Cedula + '\')">Eliminar</button>' +
            '</td></tr>');
    });
    
    setupPagination(currentClientes.length, page);
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

    var startButton = '<li class="' + startClass + '"><a class="page-link" href="#" onclick="displayClientes(1)">Inicio</a></li>';
    var endButton = '<li class="' + endClass + '"><a class="page-link" href="#" onclick="displayClientes(' + totalPages + ')">Final</a></li>';

    $('#pagination').append('<ul class="pagination justify-content-center">');

    $('#pagination ul').append(startButton);

    for (var i = startPage; i <= endPage; i++) {
        var liClass = currentPage == i ? 'page-item active' : 'page-item';
        var pageItem = '<li class="' + liClass + '"><a class="page-link" href="#" onclick="displayClientes(' + i + ')">' + i + '</a></li>';
        $('#pagination ul').append(pageItem);
    }

    $('#pagination ul').append(endButton);
}




// Función para obtener los clientes desde el servidor
function getClientes() {
    $.ajax({
        url: 'https://localhost:8083/api/cliente/Listar',
        type: 'GET',
        success: function (data) {
            console.log(data); // Añade esto para ver los datos en la consola
            currentClientes = data;
            if (data.length) {
                displayClientes(1);
                $('#errorMessage').hide();
            } else {
                $('#errorMessage').show().text('No hay clientes');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error al obtener clientes:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al obtener clientes: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function getClienteById() {
    var id = $('#searchId').val().trim();
    if (!id) {
        getClientes();
        return;
    }
    $.get('https://localhost:8083/api/cliente/Listar/' + id, function (data) {
        currentClientes = [data];
        displayClientes(1);
        // Limpiar el valor del input
        $('#searchId').val("");
    }).fail(function () {
        $('#errorMessage').show().text('Cliente no encontrado.');
    });
}

function addCliente() {
    var id = $('#addId').val().trim();
    var nombre = $('#addNombre').val().trim();
    var apellido = $('#addApellido').val().trim();
    var birth_date = $('#addBirthDate').val().trim();
    var pais = $('#addPais').val().trim();
    var email = $('#addEmail').val().trim();
    var logical_delete = $('#addLogicalDelete').val() === '0';

    if (!id || !nombre || !apellido || !pais || !email || logical_delete === '') {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: "https://localhost:8083/api/cliente/Insertar",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            Cli_Cedula: id,
            Cli_Nombre: nombre,
            Cli_Apellido: apellido,
            Cli_BirthDate: birth_date,
            Cli_Pais: pais,
            Cli_Email: email,
            Cli_LogicalDelete: logical_delete
        }),
        success: function (data) {
             // Muestra la alerta de éxito
             var alertSuccess = $('<div class="alert alert-success position-fixed bottom-0 start-0" role="alert">¡Cliente creado exitosamente!</div>');
             $('body').append(alertSuccess);
             alertSuccess.fadeIn();
 
             // Oculta la alerta después de 5 segundos
             setTimeout(function() {
                 alertSuccess.fadeOut(function() {
                     alertSuccess.remove();
                 });
             }, 3000);

            getClientes();
            $('#addId').val('');
            $('#addNombre').val('');
            $('#addApellido').val('');
            $('#addBirthDate').val('');
            $('#addPais').val('');
            $('#addEmail').val('');
            $('#addLogicalDelete').val('');
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al agregar cliente:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al agregar cliente: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function viewCliente(id) {
    const cliente = currentClientes.find(c => c.Cli_Cedula === id);
    if (cliente) {
        alert('ID: ' + cliente.Cli_Cedula + '\nNombre: ' + cliente.Cli_Nombre + '\nApellido: ' + cliente.Cli_Apellido  + '\nBirthDate: ' + cliente.Cli_BirthDate + '\nPaís: ' + cliente.Cli_Pais + '\nEmail: ' + cliente.Cli_Email + '\nlogical_delete: ' + (cliente.Cli_LogicalDelete ? 'Activo' : 'Inactivo'));
    }
}


function updateCliente() {
    var id = $('#updateId').val().trim();
    var nombre = $('#updateNombre').val().trim();
    var apellido = $('#updateApellido').val().trim();
    var birth_date = $('#updateBirthDate').val();
    var pais = $('#updatePais').val().trim();
    var email = $('#updateEmail').val().trim();
    var logical_delete = $('#updateLogicalDelete').val() === '1';

    if (!id || !nombre || !apellido || !pais || !email) {
        alert('Por favor, complete todos los campos');
        return;
    }

    $.ajax({
        url: "https://localhost:8083/api/cliente/Actualizar",
        method: "PUT",
        data: JSON.stringify({
            Cli_Cedula: id,
            Cli_Nombre: nombre,
            Cli_Apellido: apellido,
            Cli_BirthDate: birth_date,
            Cli_Pais: pais,
            Cli_Email: email,
            Cli_LogicalDelete: logical_delete
        }),
        contentType: "application/json",
        success: function (result) {
            // Muestra la alerta de éxito
            var alertSuccess = $('<div class="alert alert-info position-fixed bottom-0 start-0" role="alert">¡Cliente actualizado exitosamente!</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();

            // Oculta la alerta después de 5 segundos
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 3000);
            getClientes();
            showSection('list');
            // window.location.href = '/Views/CRUD/Clientes.html'; // Redirecciona a la página 'Index.html'
        },
        error: function (xhr, status, error) {
            console.error('Error al actualizar cliente:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al actualizar cliente: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function deleteCliente() {
    var id = $('#deleteId').val().trim();
    if (!id) {
        alert('Por favor, proporcione un ID');
        return;
    }
    $.ajax({
        url: 'https://localhost:8083/api/cliente/Eliminar/' + id,
        method: 'DELETE',
        contentType: "application/json",
        success: function (result) {
            // Muestra la alerta de éxito
            var alertSuccess = $('<div class="alert alert-warning position-fixed bottom-0 start-0" role="alert">El cliente ha sido eliminado..</div>');
            $('body').append(alertSuccess);
            alertSuccess.fadeIn();

            // Oculta la alerta después de 5 segundos
            setTimeout(function() {
                alertSuccess.fadeOut(function() {
                    alertSuccess.remove();
                });
            }, 3000);
            getClientes(); // Recargar lista de clientes
            showSection('list');
        },
        error: function (xhr, status, error) {
            console.error('Error al eliminar cliente:', xhr.status, xhr.statusText, xhr.responseText, status, error);
            alert('Error al eliminar cliente: ' + xhr.status + ' ' + xhr.statusText + ' ' + xhr.responseText + ' ' + status + ' ' + error);
        }
    });
}

function loadUpdateForm(id) {
    const cliente = currentClientes.find(c => c.Cli_Cedula === id);
    if (cliente) {
        $('#updateId').val(cliente.Cli_Cedula);
        $('#updateNombre').val(cliente.Cli_Nombre);
        $('#updateApellido').val(cliente.Cli_Apellido);
        $('#updateBirthDate').val(formatDate2(new Date(cliente.Cli_BirthDate)));
        $('#updatePais').val(cliente.Cli_Pais);
        $('#updateEmail').val(cliente.Cli_Email);
        showSection('update');
    }
}

function loadViewForm(id) {
    const cliente = currentClientes.find(c => c.Cli_Cedula === id);
    if (cliente) {
        $('#viewId').val(cliente.Cli_Cedula);
        $('#viewNombre').val(cliente.Cli_Nombre);
        $('#viewApellido').val(cliente.Cli_Apellido);
        $('#updateBirthDate').val(formatDate2(new Date(cliente.Cli_BirthDate)));
        $('#viewPais').val(cliente.Cli_Pais);
        $('#viewEmail').val(cliente.Cli_Email);
        showSection('view');
    }
}

function loadDeleteForm(id) {
    const cliente = currentClientes.find(c => c.Cli_Cedula === id);
    if (cliente) {
        $('#deleteId').val(cliente.Cli_Cedula);
        $('#deleteNombre').val(cliente.Cli_Nombre);
        $('#deleteApellido').val(cliente.Cli_Apellido);
        showSection('delete');
    }
}

// Inicializar la visualización de clientes al cargar la página
$(document).ready(function() {
    getClientes();
});
