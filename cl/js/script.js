document.addEventListener('DOMContentLoaded', function () {
    const apiUrlCL = 'https://cl.dolarapi.com/v1/cotizaciones';
    const currencyData = {
        general: []
    };
    const updateInterval = 60000; // 1 minuto
    let updateTimer;

    // 🔹 Fetch y procesar datos de Chile
    async function fetchCurrencyData() {
        try {
            const res = await fetch(apiUrlCL);
            const data = await res.json();
            console.log('Datos API Chile:', data);

            currencyData.general = data.map(d => {
                const buy = parseFloat(d.compra) || 0;
                const sell = parseFloat(d.venta) || 0;
                const promedio = buy && sell ? (buy + sell) / 2 : (buy || sell);
                const spread = sell - buy;
                const ultimoCierre = parseFloat(d.ultimoCierre) || null;

                return {
                    name: d.nombre,
                    buy: buy,
                    sell: sell,
                    promedio: promedio,
                    spread: spread,
                    ultimoCierre: ultimoCierre,
                    change: null,
                    icon:
                        d.moneda === 'USD' ? 'fa-dollar-sign' :
                        d.moneda === 'EUR' ? 'fa-euro-sign' :
                        d.moneda === 'ARS' ? 'fa-money-bill' :
                        d.moneda === 'BRL' ? 'fa-money-bill-wave' :
                        d.moneda === 'UYU' ? 'fa-coins' :
                        'fa-money-bill'
                };
            });

            createCards();
            resetProgressBar();
        } catch (e) {
            console.error('Error API Chile:', e);
        }
    }

    // 🔹 Crear cards
    function createCards() {
        const generalContainer = document.getElementById('general-cards');
        generalContainer.innerHTML = '';
        currencyData.general.forEach(c => generalContainer.appendChild(createCard(c)));
    }

    function createCard(currency) {
        const card = document.createElement('div');
        card.className = 'card';
        let titleColor = 'var(--primary-color)';

        let cardHTML = `
            <h3 class="card-title" style="color:${titleColor}">
                <i class="fas ${currency.icon}"></i> ${currency.name}
            </h3>
            <div class="card-values">
                <div class="card-value"><span>Compra:</span><span class="buy-value">$ ${currency.buy.toFixed(2)}</span></div>
                <div class="card-value"><span>Venta:</span><span class="sell-value">$ ${currency.sell.toFixed(2)}</span></div>
                <div class="card-value"><span>Promedio:</span><span>$ ${currency.promedio.toFixed(2)}</span></div>
                <div class="card-spread"><span>Spread:</span><span>$ ${currency.spread.toFixed(2)}</span></div>
        `;
        if (currency.ultimoCierre !== null) {
            cardHTML += `<div class="card-value"><span>Último cierre:</span><span>$ ${currency.ultimoCierre.toFixed(2)}</span></div>`;
        }
        cardHTML += `
            </div>
            <button class="card-btn" data-currency="${encodeURIComponent(JSON.stringify(currency))}">
                <i class="fas fa-calculator"></i> Calcular
            </button>
        `;
        card.innerHTML = cardHTML;

        card.querySelector('.card-btn').addEventListener('click', () => openCalcModal(currency));
        return card;
    }

    // 🔹 Modal (igual que antes)
    function openCalcModal(currency) {
        const modal = document.getElementById('calc-modal');
        const modalTitle = document.getElementById('modal-title');
        const currencyName = document.getElementById('currency-name');
        const currencyName2 = document.getElementById('currency-name-2');
        modalTitle.textContent = `Calculadora de ${currency.name}`;
        currencyName.textContent = currency.name;
        currencyName2.textContent = currency.name;

        const localInput = document.getElementById('ves-input'); // mismo id que usaste
        const currencyInputModal = document.getElementById('currency-input-modal');
        const localToCurrencyResult = document.getElementById('ves-to-currency-result').querySelector('.result-value');
        const currencyToLocalResult = document.getElementById('currency-to-ves-result').querySelector('.result-value');

        const localToCurrencyBtn = document.getElementById('ves-to-currency-btn');
        const currencyToLocalBtn = document.getElementById('currency-to-ves-btn');

        localToCurrencyResult.textContent = '0.00';
        currencyToLocalResult.textContent = '$ 0.00';
        localInput.value = '';
        currencyInputModal.value = '';

        localToCurrencyBtn.onclick = () => {
            const localValue = parseFloat(localInput.value) || 0;
            localToCurrencyResult.textContent = (localValue / currency.buy).toFixed(2);
        };
        currencyToLocalBtn.onclick = () => {
            const val = parseFloat(currencyInputModal.value) || 0;
            const result = val * currency.buy;
            currencyToLocalResult.textContent = `$ ${result.toFixed(2)}`;
        };

        modal.style.display = 'block';
    }

    document.getElementById('modal-close-btn').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('modal-close-footer-btn').addEventListener('click', () => modal.style.display = 'none');

    // 🔹 Barra de actualización
    let progressBarTimer, progress = 0;
    const updateBar = document.getElementById('update-bar');
    function startProgressBar() {
        clearInterval(progressBarTimer);
        progress = 0;
        const step = 100 / (updateInterval / 100);
        progressBarTimer = setInterval(() => {
            progress += step;
            if (progress >= 100) progress = 100;
            if (updateBar) updateBar.style.width = progress + '%';
        }, 100);
    }
    function resetProgressBar() { startProgressBar(); }

    // 🔹 Ejecutar fetch y auto-update
    fetchCurrencyData();
    updateTimer = setInterval(fetchCurrencyData, updateInterval);
});
