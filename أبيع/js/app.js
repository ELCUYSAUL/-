// app.js - Archivo principal que coordina toda la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Inicialización de módulos
    initTabs();
    initModals();
    initApp();
});

// Elimina esta línea de app.js:
// let currentSale = {
//     items: [],
//     total: 0
// };

// Y reemplázala con:
// Inicializar currentSale como objeto vacío
let currentSale = {
    items: [],
    get total() {
        return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
};

// Inicialización de la aplicación
function initApp() {
    // Verificar si hay un usuario logueado
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos iniciales
    loadProducts();
    loadSales();
}

// Manejo de pestañas
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y paneles
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Agregar clase active al botón y panel seleccionado
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Manejo de modales
function initModals() {
    // Modal de agregar producto
    const addProductModal = document.getElementById('add-product-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Abrir modal de agregar producto
    addProductBtn.addEventListener('click', () => {
        addProductModal.style.display = 'block';
    });

    // Cerrar modales
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Cerrar modal haciendo clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Cargar productos del usuario actual
function loadProducts() {
    const productsList = document.getElementById('products-list');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Filtrar productos del usuario actual
    const userProducts = products.filter(p => p.userId === currentUser.id);

    productsList.innerHTML = '';

    if (userProducts.length === 0) {
        productsList.innerHTML = '<p class="no-products">No hay productos registrados. Agrega tu primer producto.</p>';
        return;
    }

    userProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image || 'assets/images/default-product.png'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn primary sell-btn" data-product-id="${product.id}">Vender</button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });

    // Agregar event listeners a los botones de vender
    document.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            openSaleModal(productId);
        });
    });
}

// Abrir modal de venta para un producto específico
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
    saleProductImage.src = product.image || 'assets/images/default-product.png';
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

// Agregar producto a la venta actual
function addToSale(product, quantity) {
    const saleItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        subtotal: product.price * quantity,
        date: new Date().toISOString()
    };

    currentSale.items.push(saleItem);
    currentSale.total += saleItem.subtotal;
    updateSaleDisplay();
}

// Actualizar visualización de la venta en progreso
function updateSaleDisplay() {
    const saleItemsList = document.getElementById('sale-items-list');
    const saleTotalAmount = document.getElementById('sale-total-amount');
    const completeSaleBtn = document.getElementById('complete-sale-btn');

    saleItemsList.innerHTML = '';
    
    currentSale.items.forEach(item => {
        const saleItemElement = document.createElement('div');
        saleItemElement.className = 'sale-item';
        saleItemElement.innerHTML = `
            <span>${item.quantity} x ${item.name}</span>
            <span>$${item.subtotal.toFixed(2)}</span>
        `;
        saleItemsList.appendChild(saleItemElement);
    });

    saleTotalAmount.textContent = currentSale.total.toFixed(2);
    completeSaleBtn.disabled = currentSale.items.length === 0;

    // Configurar botón de completar venta
    completeSaleBtn.onclick = completeSale;
}

// Completar la venta actual
function completeSale() {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Registrar cada item de la venta
    currentSale.items.forEach(item => {
        sales.push({
            ...item,
            userId: currentUser.id
        });
    });

    localStorage.setItem('sales', JSON.stringify(sales));
    
    // Reiniciar venta actual
    currentSale = {
        items: [],
        total: 0
    };
    
    updateSaleDisplay();
    alert('Venta registrada exitosamente!');
}

// Cargar historial de ventas
function loadSales() {
    // Esta función se implementará más completamente en sales.js
    console.log('Cargando historial de ventas...');
}