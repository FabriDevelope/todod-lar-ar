document.addEventListener('DOMContentLoaded', function() {
    // 🔹 Datos iniciales (por si falla el fetch)
    const currencyData = {
        steam: [
            { name: 'Dólar Steam', buy: 1669.80, sell: null, spread: null, change: 0.36, icon: 'fa-gamepad' },
            { name: 'Dólar Netflix', buy: 2083.80, sell: null, spread: null, change: 0.36, icon: 'fa-tv' }
        ],
        general: [
            { name: 'Dólar Oficial', buy: 1340, sell: 1380, spread: 40, change: 0.36, icon: 'fa-landmark' },
            { name: 'Dólar Blue', buy: 1350, sell: 1370, spread: 20, change: 0.37, icon: 'fa-dollar-sign' }
            // ... agregá los demás si querés
        ],
        euro: [
            { name: 'Euro Oficial', buy: 1484, sell: 1507, spread: null, change: null, icon: 'fa-euro-sign' },
            { name: 'Euro Blue', buy: 1478, sell: 1489, spread: null, change: null, icon: 'fa-euro-sign' }
        ]
    };

    // 🔹 Fetch dinámico de Dolarito.ar
    async function fetchDolaritoData() {
        try {
            const url = encodeURIComponent("https://dolarito.ar");
            const res = await fetch(`https://api.allorigins.win/get?url=${url}`);
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, "text/html");

            // 🔹 Selectores ejemplo (inspeccioná la página para ver los correctos)
            const blueElem = doc.querySelector(".dolar-blue .value"); 
            const oficialElem = doc.querySelector(".dolar-oficial .value"); 

            if (blueElem) {
                const val = parseFloat(blueElem.textContent.replace(",", "."));
                currencyData.general.find(c => c.name === "Dólar Blue").buy = val;
            }
            if (oficialElem) {
                const val = parseFloat(oficialElem.textContent.replace(",", "."));
                currencyData.general.find(c => c.name === "Dólar Oficial").buy = val;
            }

            console.log("Datos actualizados desde Dolarito!");
        } catch (err) {
            console.error("Error al traer datos de Dolarito:", err);
        }
    }

    // 🔹 Funciones de tarjetas y modal (tu código actual)
    function createCards() {
        const steamContainer = document.getElementById('steam-cards');
        const generalContainer = document.getElementById('general-cards');
        const euroContainer = document.getElementById('euro-cards');

        // Limpiar contenedores
        steamContainer.innerHTML = "";
        generalContainer.innerHTML = "";
        euroContainer.innerHTML = "";

        currencyData.steam.forEach(c => steamContainer.appendChild(createCard(c, 'steam')));
        currencyData.general.forEach(c => generalContainer.appendChild(createCard(c, 'general')));
        currencyData.euro.forEach(c => euroContainer.appendChild(createCard(c, 'euro')));
    }

    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';

        let titleColor = 'var(--primary-color)';
        if (type === 'steam') titleColor = 'var(--accent-color)';
        else if (type === 'euro') titleColor = '#2ecc71';

        let html = `
            <h3 class="card-title" style="color:${titleColor}">
                <i class="fas ${currency.icon}"></i> ${currency.name}
            </h3>
            <div class="card-values">
        `;
        if (currency.buy !== null) html += `<div class="card-value"><span>Compra:</span> <span class="buy-value">$${currency.buy.toFixed(2)}</span></div>`;
        if (currency.sell !== null) html += `<div class="card-value"><span>Venta:</span> <span class="sell-value">$${currency.sell.toFixed(2)}</span></div>`;
        html += `</div>
            <button class="card-btn" data-currency='${encodeURIComponent(JSON.stringify(currency))}'>
                <i class="fas fa-calculator"></i> Calcular
            </button>
        `;
        card.innerHTML = html;

        card.querySelector('.card-btn').addEventListener('click', function() {
            const cur = JSON.parse(decodeURIComponent(this.getAttribute('data-currency')));
            openCalcModal(cur);
        });

        return card;
    }

    // 🔹 Modal de cálculo (idéntico a tu código)
    function openCalcModal(currency) {
        const modal = document.getElementById('calc-modal');
        const modalTitle = document.getElementById('modal-title');
        modalTitle.textContent = `Calculadora de ${currency.name}`;

        const arsInput = document.getElementById('ars-input');
        const currencyInput = document.getElementById('currency-input-modal');
        const arsToCurrencyResult = document.getElementById('ars-to-currency-result').querySelector('.result-value');
        const currencyToArsResult = document.getElementById('currency-to-ars-result').querySelector('.result-value');

        document.getElementById('ars-to-currency-btn').onclick = () => {
            const val = parseFloat(arsInput.value) || 0;
            arsToCurrencyResult.textContent = (val / currency.buy).toFixed(2);
        };
        document.getElementById('currency-to-ars-btn').onclick = () => {
            const val = parseFloat(currencyInput.value) || 0;
            currencyToArsResult.textContent = `$${(val * currency.buy).toFixed(2)}`;
        };

        modal.style.display = 'block';
    }

    // 🔹 Botón cerrar modal
    document.getElementById('modal-close-btn').onclick = () => document.getElementById('calc-modal').style.display = 'none';
    document.getElementById('modal-close-footer-btn').onclick = () => document.getElementById('calc-modal').style.display = 'none';
    window.onclick = e => {
        const modal = document.getElementById('calc-modal');
        if (e.target === modal) modal.style.display = 'none';
    };

    // 🔹 Función de animación (idéntica a tu código)
    function animateValue(element, start, end, duration = 500) {
        if (start === end) return;
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = `$${end.toFixed(2)}`;
                clearInterval(timer);
            } else {
                element.textContent = `$${current.toFixed(2)}`;
            }
        }, 16);
    }

    // 🔹 Evento calcular todos
    document.getElementById('calculate-all-btn').addEventListener('click', () => {
        document.querySelectorAll('.card').forEach(card => {
            const cur = JSON.parse(decodeURIComponent(card.querySelector('.card-btn').getAttribute('data-currency')));
            if (cur.buy !== null) {
                const buyEl = card.querySelector('.buy-value');
                animateValue(buyEl, parseFloat(buyEl.textContent.replace('$','')), cur.buy);
            }
        });
    });

    // 🔹 Inicializar: fetch + creación de tarjetas
    fetchDolaritoData().then(() => {
        createCards();
    });

    // 🔹 Opcional: refrescar cada minuto
    setInterval(async () => {
        await fetchDolaritoData();
        createCards();
    }, 60000);
});
