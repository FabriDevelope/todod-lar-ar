document.addEventListener('DOMContentLoaded', function() {
    // Datos de las cotizaciones (hardcodeados)
    const currencyData = {
        steam: [
            {
                name: 'Dólar Steam',
                buy: 1669.80,
                sell: null,
                spread: null,
                change: 0.36,
                icon: 'fa-gamepad'
            },
            {
                name: 'Dólar Netflix',
                buy: 2083.80,
                sell: null,
                spread: null,
                change: 0.36,
                icon: 'fa-tv'
            }
        ],
        general: [
            {
                name: 'Dólar Oficial',
                buy: 1340,
                sell: 1380,
                spread: 40,
                change: 0.36,
                icon: 'fa-landmark'
            },
            {
                name: 'Oficial Bancos',
                buy: 1344.41,
                sell: 1386.8,
                spread: 42.39,
                change: 0.30,
                icon: 'fa-university'
            },
            {
                name: 'Dólar Blue',
                buy: 1350,
                sell: 1370,
                spread: 20,
                change: 0.37,
                icon: 'fa-dollar-sign'
            },
            {
                name: 'Dólar Tarjeta',
                buy: 1794,
                sell: null,
                spread: null,
                change: 0.36,
                icon: 'fa-credit-card'
            },
            {
                name: 'Dólar MEP',
                buy: 1383.33,
                sell: null,
                spread: null,
                change: 0.36,
                icon: 'fa-chart-line'
            },
            {
                name: 'Dólar CCL',
                buy: 1385.55,
                sell: null,
                spread: null,
                change: 0.52,
                icon: 'fa-briefcase'
            },
            {
                name: 'Dólar Cripto',
                buy: 1381.99,
                sell: 1394.2,
                spread: 12.21,
                change: 0.31,
                icon: 'fa-bitcoin'
            },
            {
                name: 'Dólar Mayorista',
                buy: 1346,
                sell: 1355,
                spread: 9,
                change: -0.55,
                icon: 'fa-handshake'
            },
            {
                name: 'Dólar Futuro',
                buy: 1391,
                sell: 1394,
                spread: 3,
                change: 0,
                icon: 'fa-calendar-alt'
            }
        ],
        euro: [
            {
                name: 'Euro Oficial',
                buy: 1484,
                sell: 1507,
                spread: null,
                change: null,
                icon: 'fa-euro-sign'
            },
            {
                name: 'Euro Blue',
                buy: 1478,
                sell: 1489,
                spread: null,
                change: null,
                icon: 'fa-euro-sign'
            }
        ]
    };

    // Función para crear las tarjetas
    function createCards() {
        // Crear tarjetas de Steam
        const steamContainer = document.getElementById('steam-cards');
        currencyData.steam.forEach(currency => {
            steamContainer.appendChild(createCard(currency, 'steam'));
        });

        // Crear tarjetas de Dólar General
        const generalContainer = document.getElementById('general-cards');
        currencyData.general.forEach(currency => {
            generalContainer.appendChild(createCard(currency, 'general'));
        });

        // Crear tarjetas de Euro
        const euroContainer = document.getElementById('euro-cards');
        currencyData.euro.forEach(currency => {
            euroContainer.appendChild(createCard(currency, 'euro'));
        });
    }

    // Función para crear una tarjeta individual
    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Determinar el color según la categoría
        let titleColor = 'var(--primary-color)';
        if (type === 'steam') {
            titleColor = 'var(--accent-color)';
        } else if (type === 'euro') {
            titleColor = '#2ecc71';
        }
        
        // Construir el HTML de la tarjeta
        let cardHTML = `
            <h3 class="card-title" style="color: ${titleColor}">
                <i class="fas ${currency.icon}"></i> ${currency.name}
            </h3>
            <div class="card-values">
        `;
        
        if (currency.buy !== null) {
            cardHTML += `
                <div class="card-value">
                    <span>Compra:</span>
                    <span class="buy-value">$${currency.buy.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
            `;
        }
        
        if (currency.sell !== null) {
            cardHTML += `
                <div class="card-value">
                    <span>Venta:</span>
                    <span class="sell-value">$${currency.sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
            `;
        }
        
        if (currency.spread !== null) {
            cardHTML += `
                <div class="card-spread">
                    <span>Spread:</span>
                    <span>$${currency.spread.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
            `;
        }
        
        if (currency.change !== null) {
            const changeClass = currency.change >= 0 ? 'positive' : 'negative';
            const changeSymbol = currency.change >= 0 ? '+' : '';
            cardHTML += `
                <div class="card-change">
                    <span>Cambio:</span>
                    <span class="${changeClass}">${changeSymbol}${currency.change.toFixed(2)}%</span>
                </div>
            `;
        }
        
        cardHTML += `
            </div>
            <button class="card-btn" data-currency="${encodeURIComponent(JSON.stringify(currency))}">
                <i class="fas fa-calculator"></i> Calcular
            </button>
        `;
        
        card.innerHTML = cardHTML;
        
        // Agregar evento al botón de calcular
        const calculateBtn = card.querySelector('.card-btn');
        calculateBtn.addEventListener('click', function() {
            const currencyData = JSON.parse(decodeURIComponent(this.getAttribute('data-currency')));
            openCalcModal(currencyData);
        });
        
        return card;
    }

    // Función para abrir el modal de cálculo
    function openCalcModal(currency) {
        const modal = document.getElementById('calc-modal');
        const modalTitle = document.getElementById('modal-title');
        const currencyName = document.getElementById('currency-name');
        const currencyName2 = document.getElementById('currency-name-2');
        
        // Configurar el título y nombres de moneda
        modalTitle.textContent = `Calculadora de ${currency.name}`;
        currencyName.textContent = currency.name;
        currencyName2.textContent = currency.name;
        
        // Configurar eventos de los botones de cálculo
        const arsToCurrencyBtn = document.getElementById('ars-to-currency-btn');
        const currencyToArsBtn = document.getElementById('currency-to-ars-btn');
        const arsInput = document.getElementById('ars-input');
        const currencyInputModal = document.getElementById('currency-input-modal');
        const arsToCurrencyResult = document.getElementById('ars-to-currency-result').querySelector('.result-value');
        const currencyToArsResult = document.getElementById('currency-to-ars-result').querySelector('.result-value');
        
        // Evento para ARS a Moneda
        arsToCurrencyBtn.addEventListener('click', function() {
            const arsValue = parseFloat(arsInput.value) || 0;
            const rate = currency.buy; // Usamos el valor de compra como tasa
            const result = arsValue / rate;
            arsToCurrencyResult.textContent = result.toFixed(2);
        });
        
        // Evento para Moneda a ARS
        currencyToArsBtn.addEventListener('click', function() {
            const currencyValue = parseFloat(currencyInputModal.value) || 0;
            const rate = currency.buy; // Usamos el valor de compra como tasa
            const result = currencyValue * rate;
            currencyToArsResult.textContent = `$${result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        });
        
        // Mostrar el modal
        modal.style.display = 'block';
    }

    // Función para calcular una sola tarjeta
    function calculateSingle(currency, cardElement) {
        const inputValue = parseFloat(document.getElementById('currency-input').value) || 1;
        
        // Actualizar los valores con animación
        if (currency.buy !== null) {
            const buyElement = cardElement.querySelector('.buy-value');
            const buyValue = currency.buy * inputValue;
            animateValue(buyElement, parseFloat(buyElement.textContent.replace('$', '').replace(',', '')), buyValue, 500);
        }
        
        if (currency.sell !== null) {
            const sellElement = cardElement.querySelector('.sell-value');
            const sellValue = currency.sell * inputValue;
            animateValue(sellElement, parseFloat(sellElement.textContent.replace('$', '').replace(',', '')), sellValue, 500);
        }
    }

    // Función para calcular todas las tarjetas
    function calculateAll() {
        const inputValue = parseFloat(document.getElementById('currency-input').value) || 1;
        
        // Actualizar todas las tarjetas de Steam
        currencyData.steam.forEach(currency => {
            const cards = document.querySelectorAll('#steam-cards .card');
            cards.forEach(card => {
                if (card.querySelector('.card-title').textContent.trim() === currency.name) {
                    if (currency.buy !== null) {
                        const buyElement = card.querySelector('.buy-value');
                        const buyValue = currency.buy * inputValue;
                        animateValue(buyElement, parseFloat(buyElement.textContent.replace('$', '').replace(',', '')), buyValue, 500);
                    }
                }
            });
        });
        
        // Actualizar todas las tarjetas de Dólar General
        currencyData.general.forEach(currency => {
            const cards = document.querySelectorAll('#general-cards .card');
            cards.forEach(card => {
                if (card.querySelector('.card-title').textContent.trim() === currency.name) {
                    if (currency.buy !== null) {
                        const buyElement = card.querySelector('.buy-value');
                        const buyValue = currency.buy * inputValue;
                        animateValue(buyElement, parseFloat(buyElement.textContent.replace('$', '').replace(',', '')), buyValue, 500);
                    }
                    
                    if (currency.sell !== null) {
                        const sellElement = card.querySelector('.sell-value');
                        const sellValue = currency.sell * inputValue;
                        animateValue(sellElement, parseFloat(sellElement.textContent.replace('$', '').replace(',', '')), sellValue, 500);
                    }
                }
            });
        });
        
        // Actualizar todas las tarjetas de Euro
        currencyData.euro.forEach(currency => {
            const cards = document.querySelectorAll('#euro-cards .card');
            cards.forEach(card => {
                if (card.querySelector('.card-title').textContent.trim() === currency.name) {
                    if (currency.buy !== null) {
                        const buyElement = card.querySelector('.buy-value');
                        const buyValue = currency.buy * inputValue;
                        animateValue(buyElement, parseFloat(buyElement.textContent.replace('$', '').replace(',', '')), buyValue, 500);
                    }
                    
                    if (currency.sell !== null) {
                        const sellElement = card.querySelector('.sell-value');
                        const sellValue = currency.sell * inputValue;
                        animateValue(sellElement, parseFloat(sellElement.textContent.replace('$', '').replace(',', '')), sellValue, 500);
                    }
                }
            });
        });
    }

    // Función para animar los valores
    function animateValue(element, start, end, duration) {
        if (start === end) return;
        
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                element.textContent = `$${end.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                clearInterval(timer);
            } else {
                element.textContent = `$${current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
            }
        }, 16);
    }

    // Evento para el botón "Calcular todos"
    document.getElementById('calculate-all-btn').addEventListener('click', calculateAll);

    // Evento para el input (calcular al presionar Enter)
    document.getElementById('currency-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateAll();
        }
    });

    // Eventos para cerrar el modal
    document.getElementById('modal-close-btn').addEventListener('click', function() {
        document.getElementById('calc-modal').style.display = 'none';
    });

    document.getElementById('modal-close-footer-btn').addEventListener('click', function() {
        document.getElementById('calc-modal').style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('calc-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Crear las tarjetas al cargar la página
    createCards();
});