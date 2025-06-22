// sales.js - Manejo del sistema de ventas para la tienda de abarrotes
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar eventos de ventas
    initSales();
});

// Variable para llevar el conteo de intentos
let verificationAttempts = 0;
const MAX_ATTEMPTS = 5;

// Inicializar el módulo de ventas
function initSales() {
    // Verificar si hay un usuario autenticado
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('Usuario no autenticado. No se puede inicializar el módulo de ventas.');
        return;
    }

    // Escuchar evento cuando se agrega un producto desde products.js
    document.addEventListener('productAddedToSale', (e) => {
        const { product, quantity } = e.detail;
        
        // Verificar si el producto ya está en la venta
        const existingItemIndex = currentSale.items.findIndex(
            item => item.productId === product.id
        );

        if (existingItemIndex >= 0) {
            // Actualizar cantidad si ya existe
            currentSale.items[existingItemIndex].quantity += quantity;
            currentSale.items[existingItemIndex].subtotal = 
                currentSale.items[existingItemIndex].quantity * 
                currentSale.items[existingItemIndex].price;
        } else {
            // Agregar nuevo item
            currentSale.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                subtotal: product.price * quantity,
                date: new Date().toISOString()
            });
        }
        
        updateSaleDisplay();
    });

    // Inicializar botón de finalizar venta
    document.getElementById('complete-sale-btn')?.addEventListener('click', handleCompleteSale);
    
    // Cargar historial al inicio
    loadSalesHistory();
}

// Función para manejar el completado de venta con límite de intentos
function handleCompleteSale() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Por favor inicie sesión para completar la venta');
        return;
    }

    if (currentSale.items.length === 0) {
        alert('No hay items en la venta');
        return;
    }

    if (verificationAttempts >= MAX_ATTEMPTS) {
        alert(`Has excedido el número máximo de intentos (${MAX_ATTEMPTS}). Por favor reinicia la página.`);
        return;
    }

    verificationAttempts++;
    completeCurrentSale();
}

// Función auxiliar para obtener el usuario actual con validación
function getCurrentUser() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            return null;
        }
        return currentUser;
    } catch (e) {
        return null;
    }
}

// Objeto para manejar la venta actual
if (!window.currentSale) {
    window.currentSale = {
        items: [],
        get total() {
            return this.items.reduce((sum, item) => sum + item.subtotal, 0);
        }
    };
}

// Agregar un item a la venta actual
function addSaleItem(product, quantity) {
    const existingItem = currentSale.items.find(item => item.productId === product.id);

    if (existingItem) {
        // Si el producto ya está en la venta, actualizar cantidad
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        // Si es un producto nuevo, agregarlo a la venta
        const saleItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            subtotal: product.price * quantity,
            date: new Date().toISOString()
        };
        currentSale.items.push(saleItem);
    }

    updateSaleDisplay();
}

// Actualizar la visualización de la venta en curso
function updateSaleDisplay() {
    const saleItemsList = document.getElementById('sale-items-list');
    const saleTotalAmount = document.getElementById('sale-total-amount');
    const completeSaleBtn = document.getElementById('complete-sale-btn');

    if (!saleItemsList || !saleTotalAmount || !completeSaleBtn) {
        console.error('Elementos del DOM para mostrar la venta no encontrados');
        return;
    }

    // Limpiar lista actual
    saleItemsList.innerHTML = '';

    // Mostrar cada item de la venta
    currentSale.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'sale-item';
        itemElement.innerHTML = `
            <div class="sale-item-info">
                <span class="sale-item-name">${item.name}</span>
                <span class="sale-item-price">$${item.price.toFixed(2)} c/u</span>
            </div>
            <div class="sale-item-actions">
                <input type="number" min="1" value="${item.quantity}" 
                       class="sale-item-quantity" data-product-id="${item.productId}">
                <span class="sale-item-subtotal">$${item.subtotal.toFixed(2)}</span>
                <button class="btn danger sale-item-remove" data-product-id="${item.productId}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        saleItemsList.appendChild(itemElement);
    });

    // Actualizar total
    saleTotalAmount.textContent = currentSale.total.toFixed(2);
    completeSaleBtn.disabled = currentSale.items.length === 0;

    // Agregar eventos a los inputs de cantidad
    document.querySelectorAll('.sale-item-quantity').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            const newQuantity = parseInt(e.target.value) || 1;
            updateSaleItemQuantity(productId, newQuantity);
        });
    });

    // Agregar eventos a los botones de eliminar
    document.querySelectorAll('.sale-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-product-id'));
            removeSaleItem(productId);
        });
    });
}

// Actualizar cantidad de un item en la venta
function updateSaleItemQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        alert('La cantidad debe ser al menos 1');
        return;
    }

    const item = currentSale.items.find(item => item.productId === productId);
    if (item) {
        item.quantity = newQuantity;
        item.subtotal = item.price * newQuantity;
        updateSaleDisplay();
    }
}

// Eliminar un item de la venta
function removeSaleItem(productId) {
    currentSale.items = currentSale.items.filter(item => item.productId !== productId);
    updateSaleDisplay();
}

// Finalizar la venta actual y guardar en el historial
function completeCurrentSale() {
    if (currentSale.items.length === 0) {
        alert('No hay items en la venta');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Por favor inicie sesión para completar la venta');
        return;
    }

    const sales = JSON.parse(localStorage.getItem('sales')) || [];

    // Agregar cada item al historial de ventas
    currentSale.items.forEach(item => {
        sales.push({
            ...item,
            userId: currentUser.id,
            date: new Date().toISOString()
        });
    });

    // Guardar en localStorage
    localStorage.setItem('sales', JSON.stringify(sales));

    // Mostrar resumen de venta
    showSaleSummary(currentSale);

    // Reiniciar venta actual
    currentSale.items = [];
    updateSaleDisplay();

    // Actualizar historial de ventas
    loadSalesHistory();
}

// Mostrar resumen de la venta completada
function showSaleSummary(sale) {
    const summaryHTML = `
        <div class="sale-summary">
            <h3><i class="fas fa-check-circle"></i> Venta completada</h3>
            <div class="summary-items">
                ${sale.items.map(item => `
                    <div class="summary-item">
                        <span>${item.quantity} x ${item.name}</span>
                        <span>$${item.subtotal.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-total">
                <span>Total:</span>
                <span>$${sale.total.toFixed(2)}</span>
            </div>
            <button id="print-summary-btn" class="btn primary">
                <i class="fas fa-print"></i> Imprimir
            </button>
        </div>
    `;

    // Mostrar el resumen (podría ser en un modal o sección específica)
    alert('Venta registrada exitosamente!');
    console.log(summaryHTML); // En una app real, mostraríamos esto en la UI
}

// Cargar historial de ventas
function loadSalesHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        const reportResults = document.getElementById('report-results');
        if (reportResults) {
            reportResults.innerHTML = '<p class="no-sales">Por favor inicie sesión para ver el historial</p>';
        }
        return;
    }

    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const reportResults = document.getElementById('report-results');

    if (!reportResults) {
        console.error('Elemento para mostrar reportes no encontrado');
        return;
    }

    // Filtrar ventas del usuario actual
    const userSales = sales.filter(sale => sale.userId === currentUser.id);

    if (userSales.length === 0) {
        reportResults.innerHTML = '<p class="no-sales">No hay ventas registradas</p>';
        return;
    }

    // Agrupar ventas por fecha
    const salesByDate = {};
    userSales.forEach(sale => {
        const saleDate = new Date(sale.date).toLocaleDateString();
        if (!salesByDate[saleDate]) {
            salesByDate[saleDate] = [];
        }
        salesByDate[saleDate].push(sale);
    });

    // Generar HTML del reporte
    let reportHTML = '<div class="sales-report">';
    
    for (const date in salesByDate) {
        const dailySales = salesByDate[date];
        const dailyTotal = dailySales.reduce((sum, sale) => sum + sale.subtotal, 0);
        
        reportHTML += `
            <div class="sales-day">
                <h4>${date}</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>P. Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dailySales.map(sale => `
                            <tr>
                                <td>${sale.name}</td>
                                <td>${sale.quantity}</td>
                                <td>$${sale.price.toFixed(2)}</td>
                                <td>$${sale.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="day-total">
                            <td colspan="3">Total del día:</td>
                            <td>$${dailyTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    reportHTML += '</div>';
    reportResults.innerHTML = reportHTML;
}

// Configurar el botón de finalizar venta
document.getElementById('complete-sale-btn')?.addEventListener('click', completeCurrentSale);

// Configurar el botón de generar reporte
document.getElementById('generate-report-btn')?.addEventListener('click', loadSalesHistory);