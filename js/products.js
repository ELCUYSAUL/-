// products.js - Manejo de productos para la tienda de abarrotes
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar eventos del formulario de producto
    initProductForm();
});

// Inicializar el formulario para agregar productos
function initProductForm() {
    const addProductForm = document.getElementById('add-product-form');
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }
}

// Guardar un nuevo producto
function saveProduct() {
    const productName = document.getElementById('product-name').value.trim();
    const productPrice = parseFloat(document.getElementById('product-price').value);
    const productImage = document.getElementById('product-image').value.trim();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Validaciones básicas
    if (!productName) {
        alert('Por favor ingresa el nombre del producto');
        return;
    }

    if (isNaN(productPrice) || productPrice <= 0) {
        alert('Por favor ingresa un precio válido');
        return;
    }

    // Obtener productos existentes o inicializar array
    let products = JSON.parse(localStorage.getItem('products')) || [];

    // Crear nuevo producto
    const newProduct = {
        id: Date.now(), // Usamos timestamp como ID simple
        userId: currentUser.id,
        name: productName,
        price: productPrice,
        image: productImage || 'assets/images/default-product.png',
        createdAt: new Date().toISOString()
    };

    // Agregar producto y guardar
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    // Cerrar modal y limpiar formulario
    document.getElementById('add-product-modal').style.display = 'none';
    addProductForm.reset();

    // Recargar lista de productos
    loadProducts();

    // Mostrar confirmación
    alert(`Producto "${productName}" agregado correctamente!`);
}

// Cargar y mostrar productos (también usado desde app.js)
function loadProducts() {
    const productsList = document.getElementById('products-list');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Filtrar productos del usuario actual
    const userProducts = products.filter(p => p.userId === currentUser.id);

    productsList.innerHTML = '';

    if (userProducts.length === 0) {
        productsList.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open fa-3x"></i>
                <p>No hay productos registrados</p>
                <button id="add-first-product" class="btn primary">Agregar primer producto</button>
            </div>
        `;

        // Evento para el botón de agregar primer producto
        document.getElementById('add-first-product')?.addEventListener('click', () => {
            document.getElementById('add-product-modal').style.display = 'block';
        });
        return;
    }

    // Mostrar cada producto en una tarjeta
    userProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='assets/images/default-product.png'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn primary sell-btn" data-product-id="${product.id}">
                        <i class="fas fa-cash-register"></i> Vender
                    </button>
                    <button class="btn danger delete-btn" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });

    // Agregar eventos a los botones de vender
    document.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-product-id'));
            openSaleModal(productId);
        });
    });

    // Agregar eventos a los botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-product-id'));
            deleteProduct(productId);
        });
    });
}

// Eliminar un producto
function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
        return;
    }

    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Filtrar para eliminar el producto
    products = products.filter(p => p.id !== productId);
    
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts(); // Recargar la lista
}

// Abrir modal de venta (también usado desde app.js)
function openSaleModal(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const saleModal = document.getElementById('sale-modal');
    const saleProductName = document.getElementById('sale-product-name');
    const saleProductImage = document.getElementById('sale-product-image');
    const saleProductPrice = document.getElementById('sale-product-price');
    const saleQuantity = document.getElementById('sale-quantity');
    const saleTotal = document.getElementById('sale-total');

    // Configurar modal con datos del producto
    saleProductName.textContent = product.name;
    saleProductImage.src = product.image;
    saleProductImage.onerror = function() {
        this.src = 'assets/images/default-product.png';
    };
    saleProductPrice.textContent = product.price.toFixed(2);
    saleQuantity.value = 1;
    saleTotal.textContent = product.price.toFixed(2);

    // Actualizar total cuando cambia la cantidad
    saleQuantity.addEventListener('input', () => {
        const quantity = parseInt(saleQuantity.value) || 0;
        const total = quantity * product.price;
        saleTotal.textContent = total.toFixed(2);
    });

    // Configurar botón de confirmar venta
    const confirmSaleBtn = document.getElementById('confirm-sale-btn');
    confirmSaleBtn.onclick = () => {
        const quantity = parseInt(saleQuantity.value) || 0;
        
        if (quantity <= 0) {
            alert('La cantidad debe ser mayor a cero');
            return;
        }

        addToSale(product, quantity);
        saleModal.style.display = 'none';
    };

    saleModal.style.display = 'block';
}

// Cambiar la función addToSale al final del archivo por:
function addToSale(product, quantity) {
    // Enviar evento personalizado con los datos necesarios
    const saleEvent = new CustomEvent('productAddedToSale', {
        detail: {
            product: {
                id: product.id,
                name: product.name,
                price: product.price
            },
            quantity: quantity
        }
    });
    document.dispatchEvent(saleEvent);
}