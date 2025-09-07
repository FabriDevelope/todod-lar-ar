document.addEventListener('DOMContentLoaded', function() {
    const currencyData = {
        steam: [
            { name: 'Dólar Steam', buy: 1669.80, sell: null, spread: null, change: 0.36, icon: 'fa-gamepad' },
            { name: 'Dólar Netflix', buy: 2083.80, sell: null, spread: null, change: 0.36, icon: 'fa-tv' }
        ],
        general: [], // Dólares API
        euro: []     // Otras monedas API
    };

    // 🔹 Función para renombrar los datos de la API de forma fachera
    function renameCurrency(name) {
        name = name.toLowerCase();
        if(name.includes('oficial')) return 'Dólar Oficial';
        if(name.includes('blue')) return 'Dólar Blue';
        if(name.includes('tarjeta')) return 'Dólar Tarjeta';
        if(name.includes('mep')) return 'Dólar MEP';
        if(name.includes('ccl')) return 'Dólar CCL';
        if(name.includes('cripto')) return 'Dólar Cripto';
        if(name.includes('mayorista')) return 'Dólar Mayorista';
        if(name.includes('futuro')) return 'Dólar Futuro';
        if(name.includes('euro')) return 'Euro';
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // 🔹 Crear cards
    function createCards() {
        const steamContainer = document.getElementById('steam-cards');
        const generalContainer = document.getElementById('general-cards');
        const euroContainer = document.getElementById('euro-cards');

        steamContainer.innerHTML = '';
        generalContainer.innerHTML = '';
        euroContainer.innerHTML = '';

        currencyData.steam.forEach(c => steamContainer.appendChild(createCard(c, 'steam')));
        currencyData.general.forEach(c => generalContainer.appendChild(createCard(c, 'general')));
        currencyData.euro.forEach(c => euroContainer.appendChild(createCard(c, 'euro')));
    }

    // 🔹 Crear una card individual
    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';

        let titleColor = type === 'steam' ? 'var(--accent-color)' : type === 'euro' ? '#2ecc71' : 'var(--primary-color)';

        let cardHTML = `<h3 class="card-title" style="color: ${titleColor}"><i class="fas ${currency.icon}"></i> ${currency.name}</h3><div class="card-values">`;

        if(currency.buy !== null) cardHTML += `<div class="card-value"><span>Compra:</span><span class="buy-value">$${currency.buy.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>`;
        if(currency.sell !== null) cardHTML += `<div class="card-value"><span>Venta:</span><span class="sell-value">$${currency.sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>`;
        if(currency.spread !== null) cardHTML += `<div class="card-spread"><span>Spread:</span><span>$${currency.spread.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span></div>`;
        if(currency.change !== null){
            const changeClass = currency.change >= 0 ? 'positive' : 'negative';
            const changeSymbol = currency.change >= 0 ? '+' : '';
            cardHTML += `<div class="card-change"><span>Cambio:</span><span class="${changeClass}">${changeSymbol}${currency.change.toFixed(2)}%</span></div>`;
        }

        cardHTML += `</div>
        <button class="card-btn" data-currency="${encodeURIComponent(JSON.stringify(currency))}"><i class="fas fa-calculator"></i> Calcular</button>
        <input type="number" class="card-input" placeholder="Cantidad" />`;

        card.innerHTML = cardHTML;

        const btn = card.querySelector('.card-btn');
        const input = card.querySelector('.card-input');

        // Calcular individual con animación
        btn.addEventListener('click', () => {
            const value = parseFloat(input.value) || 1;
            if(currency.buy !== null){
                const buyEl = card.querySelector('.buy-value');
                animateValue(buyEl, parseFloat(buyEl.textContent.replace('$','').replace(/,/g,'')), currency.buy*value, 500);
            }
            if(currency.sell !== null){
                const sellEl = card.querySelector('.sell-value');
                animateValue(sellEl, parseFloat(sellEl.textContent.replace('$','').replace(/,/g,'')), currency.sell*value, 500);
            }
        });

        return card;
    }

    // 🔹 Animación
    function animateValue(element, start, end, duration){
        if(start===end) return;
        const range = end-start;
        const increment = range/(duration/16);
        let current = start;
        const timer = setInterval(()=>{
            current+=increment;
            if((increment>0 && current>=end)||(increment<0 && current<=end)){
                element.textContent = `$${end.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                clearInterval(timer);
            }else{
                element.textContent = `$${current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            }
        },16);
    }

    // 🔹 Función calcular todos
    function calculateAll(){
        const inputValue = parseFloat(document.getElementById('currency-input').value) || 1;
        document.querySelectorAll('.card').forEach(card=>{
            const buyEl = card.querySelector('.buy-value');
            const sellEl = card.querySelector('.sell-value');
            const currency = JSON.parse(decodeURIComponent(card.querySelector('.card-btn').getAttribute('data-currency')));
            if(buyEl) animateValue(buyEl, parseFloat(buyEl.textContent.replace('$','').replace(/,/g,'')), currency.buy*inputValue, 500);
            if(sellEl && currency.sell) animateValue(sellEl, parseFloat(sellEl.textContent.replace('$','').replace(/,/g,'')), currency.sell*inputValue, 500);
        });
    }

    document.getElementById('calculate-all-btn').addEventListener('click', calculateAll);
    document.getElementById('currency-input').addEventListener('keypress', function(e){if(e.key==='Enter') calculateAll();});

    // 🔹 Fetch API y actualizar
    async function fetchCurrencyData(){
        try{
            // Dólares
            const resDollar = await fetch('https://dolarapi.com/v1/dolares');
            const dolarData = await resDollar.json();
            currencyData.general = dolarData.map(d=>{
                return {
                    name: renameCurrency(d.casa),
                    buy: parseFloat(d.compra),
                    sell: parseFloat(d.venta),
                    spread: d.venta?parseFloat(d.venta)-parseFloat(d.compra):null,
                    change: null,
                    icon: d.casa.toLowerCase().includes('blue')?'fa-dollar-sign':'fa-landmark'
                };
            });

            // Otras monedas
            const resOther = await fetch('https://dolarapi.com/v1/cotizaciones');
            const otherData = await resOther.json();
            currencyData.euro = otherData.map(d=>{
                return {
                    name: renameCurrency(d.casa),
                    buy: parseFloat(d.compra),
                    sell: parseFloat(d.venta),
                    spread: d.venta?parseFloat(d.venta)-parseFloat(d.compra):null,
                    change: null,
                    icon: d.casa.toLowerCase().includes('euro')?'fa-euro-sign':'fa-money-bill'
                };
            });

            createCards();
        }catch(e){
            console.error('Error actualizando API:',e);
        }
    }

    // Inicializar
    createCards();
    fetchCurrencyData();
    setInterval(fetchCurrencyData,60000);
});
