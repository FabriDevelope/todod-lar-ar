document.addEventListener('DOMContentLoaded', function() {
    // Datos hardcodeados de Entretenimiento
    const currencyData = {
        steam: [
            { name: 'Dólar Steam', buy: 1669.80, sell: null, spread: null, change: 0.36, icon: 'fa-gamepad' },
            { name: 'Dólar Netflix', buy: 2083.80, sell: null, spread: null, change: 0.36, icon: 'fa-tv' }
        ],
        general: [], // Se llenará con la API de Dólares
        euro: []     // Se llenará con la API de Otras Monedas
    };

    // Función para crear tarjetas (igual que antes)
    function createCards() {
        document.getElementById('steam-cards').innerHTML = '';
        document.getElementById('general-cards').innerHTML = '';
        document.getElementById('euro-cards').innerHTML = '';

        currencyData.steam.forEach(currency => document.getElementById('steam-cards').appendChild(createCard(currency, 'steam')));
        currencyData.general.forEach(currency => document.getElementById('general-cards').appendChild(createCard(currency, 'general')));
        currencyData.euro.forEach(currency => document.getElementById('euro-cards').appendChild(createCard(currency, 'euro')));
    }

    // Función para crear una tarjeta individual (igual que antes)
    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';

        let titleColor = 'var(--primary-color)';
        if (type === 'steam') titleColor = 'var(--accent-color)';
        else if (type === 'euro') titleColor = '#2ecc71';

        let cardHTML = `<h3 class="card-title" style="color: ${titleColor}"><i class="fas ${currency.icon}"></i> ${currency.name}</h3><div class="card-values">`;

        if (currency.buy !== null) cardHTML += `<div class="card-value"><span>Compra:</span><span class="buy-value">$${currency.buy.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>`;
        if (currency.sell !== null) cardHTML += `<div class="card-value"><span>Venta:</span><span class="sell-value">$${currency.sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>`;
        if (currency.spread !== null) cardHTML += `<div class="card-spread"><span>Spread:</span><span>$${currency.spread.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>`;
        if (currency.change !== null) {
            const changeClass = currency.change >= 0 ? 'positive' : 'negative';
            const changeSymbol = currency.change >= 0 ? '+' : '';
            cardHTML += `<div class="card-change"><span>Cambio:</span><span class="${changeClass}">${changeSymbol}${currency.change.toFixed(2)}%</span></div>`;
        }

        cardHTML += `</div><button class="card-btn" data-currency="${encodeURIComponent(JSON.stringify(currency))}"><i class="fas fa-calculator"></i> Calcular</button>`;
        card.innerHTML = cardHTML;

        card.querySelector('.card-btn').addEventListener('click', function() {
            openCalcModal(JSON.parse(decodeURIComponent(this.getAttribute('data-currency'))));
        });

        return card;
    }

    // Modal y funciones de cálculo siguen igual que tu código original
    function openCalcModal(currency) { /* ...igual que antes... */ }
    function calculateSingle(currency, cardElement) { /* ...igual que antes... */ }
    function calculateAll() { /* ...igual que antes... */ }
    function animateValue(element, start, end, duration) { /* ...igual que antes... */ }

    document.getElementById('calculate-all-btn').addEventListener('click', calculateAll);
    document.getElementById('currency-input').addEventListener('keypress', function(e) { if(e.key==='Enter') calculateAll(); });
    document.getElementById('modal-close-btn').addEventListener('click', ()=>document.getElementById('calc-modal').style.display='none');
    document.getElementById('modal-close-footer-btn').addEventListener('click', ()=>document.getElementById('calc-modal').style.display='none');
    window.addEventListener('click', function(event) { if(event.target===document.getElementById('calc-modal')) document.getElementById('calc-modal').style.display='none'; });

    // 🔹 Función para traer datos de la API y actualizar cards
    async function fetchCurrencyData() {
        try {
            // Dólares
            const resDollar = await fetch('https://dolarapi.com/v1/dolares');
            const dolarData = await resDollar.json();
            currencyData.general = dolarData.map(d => ({
                name: d.casa,
                buy: parseFloat(d.compra),
                sell: parseFloat(d.venta),
                spread: d.venta ? parseFloat(d.venta)-parseFloat(d.compra) : null,
                change: null,
                icon: d.casa.toLowerCase().includes('blue') ? 'fa-dollar-sign' : 'fa-landmark'
            }));

            // Otras monedas
            const resOther = await fetch('https://dolarapi.com/v1/cotizaciones');
            const otherData = await resOther.json();
            currencyData.euro = otherData.map(d => ({
                name: d.casa,
                buy: parseFloat(d.compra),
                sell: parseFloat(d.venta),
                spread: d.venta ? parseFloat(d.venta)-parseFloat(d.compra) : null,
                change: null,
                icon: d.casa.toLowerCase().includes('euro') ? 'fa-euro-sign' : 'fa-money-bill'
            }));

            createCards();
        } catch(e) {
            console.error('Error actualizando datos de API:', e);
        }
    }

    // 🔹 Inicializar
    createCards();       // Primero renderiza entretenimiento
    fetchCurrencyData(); // Luego actualiza desde API
    setInterval(fetchCurrencyData, 60000); // Actualiza cada 60s
});
