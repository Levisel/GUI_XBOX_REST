document.addEventListener('DOMContentLoaded', () => {
    const miIcono = document.getElementById('miCarro');
  
    miIcono.addEventListener('click', () => {
      // Abre la página local en una nueva ventana o pestaña
      window.location.href = '/Views/Carrito.html';
    });
  });
  
  document.getElementById("cart-count").addEventListener("click", function() {
    this.classList.add("botonPresionado");
  }) 