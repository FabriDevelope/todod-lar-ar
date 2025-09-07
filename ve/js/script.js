document.addEventListener('DOMContentLoaded', function() {
    const apiUrlVE = 'https://ve.dolarapi.com/v1/dolares';
    const currencyData = {
        general: []
    };
    const updateInterval = 60000; // 1 minuto
    let updateTimer;

    // 🔹 Fetch y procesar datos de Venezuela
    async function fetchCurrencyData() {
        try {
            const res = await fetch(apiUrlVE);
            const data = await res.json();
            console.log('Datos API Venezuela:', data);

            currencyData.general = data.map(d => {
                const promedio = parseFloat(d.promedio) || 0;
                const buy = promedio;   // promedio como compra
                const sell = promedio;  // promedio como venta
                const spread = sell - buy; // siempre 0, pero se puede usar margen si querés
                return {
                    name: d.nombre,
                    buy: buy,
                    sell: sell,
                    spread: spread,
                    change: null, // si la API no devuelve variación
                    icon: d.fuente === 'oficial' ? 'fa-landmark' :
                          d.fuente === 'paralelo' ? 'fa-dollar-sign' :
                          d.fuente === 'bitcoin' ? 'fa-bitcoin' : 'fa-money-bill'
                };
            });

            createCards();
            resetProgressBar();
        } catch (e) {
            console.error('Error API Venezuela:', e);
        }
    }

    // 🔹 Crear cards (igual que antes)
    function createCards() {
        const generalContainer = document.getElementById('general-cards');
        generalContainer.innerHTML = '';
        currencyData.general.forEach(c => generalContainer.appendChild(createCard(c)));
    }

    function createCard(currency) {
        const card = document.createElement('div');
        card.className = 'card';
        let titleColor = 'var(--primary-color)';

        const cardHTML = `
            <h3 class="card-title" style="color:${titleColor}">
                <i class="fas ${currency.icon}"></i> ${currency.name}
            </h3>
            <div class="card-values">
                <div class="card-value"><span>Compra:</span><span class="buy-value">Bs ${currency.buy.toFixed(2)}</span></div>
                <div class="card-value"><span>Venta:</span><span class="sell-value">Bs ${currency.sell.toFixed(2)}</span></div>
                <div class="card-spread"><span>Spread:</span><span>Bs ${currency.spread.toFixed(2)}</span></div>
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
    function openCalcModal(currency){
        const modal = document.getElementById('calc-modal');
        const modalTitle = document.getElementById('modal-title');
        const currencyName = document.getElementById('currency-name');
        const currencyName2 = document.getElementById('currency-name-2');
        modalTitle.textContent = `Calculadora de ${currency.name}`;
        currencyName.textContent = currency.name;
        currencyName2.textContent = currency.name;

        const vesInput = document.getElementById('ves-input');
        const currencyInputModal = document.getElementById('currency-input-modal');
        const vesToCurrencyResult = document.getElementById('ves-to-currency-result').querySelector('.result-value');
        const currencyToVesResult = document.getElementById('currency-to-ves-result').querySelector('.result-value');

        const vesToCurrencyBtn = document.getElementById('ves-to-currency-btn');
        const currencyToVesBtn = document.getElementById('currency-to-ves-btn');

        vesToCurrencyResult.textContent = '0.00';
        currencyToVesResult.textContent = 'Bs 0.00';
        vesInput.value = '';
        currencyInputModal.value = '';

        vesToCurrencyBtn.onclick = () => {
            const vesValue = parseFloat(vesInput.value)||0;
            vesToCurrencyResult.textContent = (vesValue / currency.buy).toFixed(2);
        };
        currencyToVesBtn.onclick = () => {
            const val = parseFloat(currencyInputModal.value)||0;
            const result = val * currency.buy;
            currencyToVesResult.textContent = `Bs ${result.toFixed(2)}`;
        };

        modal.style.display = 'block';
    }

    document.getElementById('modal-close-btn').addEventListener('click', ()=> modal.style.display='none');
    document.getElementById('modal-close-footer-btn').addEventListener('click', ()=> modal.style.display='none');

    // 🔹 Barra de actualización
    let progressBarTimer, progress = 0;
    const updateBar = document.getElementById('update-bar');
    function startProgressBar(){
        clearInterval(progressBarTimer);
        progress = 0;
        const step = 100 / (updateInterval / 100);
        progressBarTimer = setInterval(()=>{
            progress += step;
            if(progress >= 100) progress = 100;
            if(updateBar) updateBar.style.width = progress+'%';
        }, 100);
    }
    function resetProgressBar(){ startProgressBar(); }

    // 🔹 Ejecutar fetch y auto-update
    fetchCurrencyData();
    updateTimer = setInterval(fetchCurrencyData, updateInterval);
});
