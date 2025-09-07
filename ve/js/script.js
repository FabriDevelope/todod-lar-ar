document.addEventListener('DOMContentLoaded', function() {
    // URL de la API para Venezuela
    const apiUrl = 'https://ve.dolarapi.com/v1/dolares';
    
    // Función para obtener los datos de la API
    async function fetchCurrencyData() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            return null;
        }
    }

    // Función para procesar los datos y organizarlos por categorías
    function processCurrencyData(data) {
        const currencyData = {
            general: []
        };

        data.forEach(currency => {
            // Extraer el nombre y otros datos
            const name = currency.nombre;
            const buy = currency.compra;
            const sell = currency.venta;
            const spread = buy && sell ? sell - buy : null;
            const change = currency.variacion;

            // Asignar iconos según el tipo de dólar
            let icon = 'fa-dollar-sign';
            if (name.includes('Oficial') || name.includes('Banco')) {
                icon = 'fa-landmark';
            } else if (name.includes('Paralelo')) {
                icon = 'fa-dollar-sign';
            } else if (name.includes('BCV')) {
                icon = 'fa-university';
            } else if (name.includes('Monitor')) {
                icon = 'fa-chart-line';
            } else if (name.includes('Euro')) {
                icon = 'fa-euro-sign';
            }

            currencyData.general.push({
                name: name,
                buy: buy,
                sell: sell,
                spread: spread,
                change: change,
                icon: icon
            });
        });

        return currencyData;
    }

    // Función para crear las tarjetas
    function createCards(currencyData) {
        // Crear tarjetas de Dólar General
        const generalContainer = document.getElementById('general-cards');
        generalContainer.innerHTML = '';
        currencyData.general.forEach(currency => {
            generalContainer.appendChild(createCard(currency, 'general'));
        });
    }

    // Función para crear una tarjeta individual
    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Determinar el color según la categoría
        let titleColor = 'var(--primary-color)';
        
        // Construir el HTML de la tarjeta
        let cardHTML = `
            <h3 class="card-title" style="color: ${titleColor}">
                <i class="fas ${currency.icon}"></i> ${currency.name}
            </h3>
            <div class="card-values">
        `;
        
        if (currency.buy !== null && currency.buy !== undefined) {
            cardHTML += `
                <div class="card-value">
                    <span>Compra:</span>
                    <span class="buy-value">Bs ${formatNumberVES(currency.buy)}</span>
                </div>
            `;
        }
        
        if (currency.sell !== null && currency.sell !== undefined) {
            cardHTML += `
                <div class="card-value">
                    <span>Venta:</span>
                    <span class="sell-value">Bs ${formatNumberVES(currency.sell)}</span>
                </div>
            `;
        }
        
        if (currency.spread !== null && currency.spread !== undefined) {
            cardHTML += `
                <div class="card-spread">
                    <span>Spread:</span>
                    <span>Bs ${formatNumberVES(currency.spread)}</span>
                </div>
            `;
        }
        
        if (currency.change !== null && currency.change !== undefined) {
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

    // Función para formatear números grandes para VES
    function formatNumberVES(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else {
            return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
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
        const vesToCurrencyBtn = document.getElementById('ves-to-currency-btn');
        const currencyToVesBtn = document.getElementById('currency-to-ves-btn');
        const vesInput = document.getElementById('ves-input');
        const currencyInputModal = document.getElementById('currency-input-modal');
        const vesToCurrencyResult = document.getElementById('ves-to-currency-result').querySelector('.result-value');
        const currencyToVesResult = document.getElementById('currency-to-ves-result').querySelector('.result-value');
        
        // Evento para VES a Moneda
        vesToCurrencyBtn.addEventListener('click', function() {
            const vesValue = parseFloat(vesInput.value) || 0;
            const rate = currency.buy; // Usamos el valor de compra como tasa
            const result = vesValue / rate;
            vesToCurrencyResult.textContent = result.toFixed(2);
        });
        
        // Evento para Moneda a VES
        currencyToVesBtn.addEventListener('click', function() {
            const currencyValue = parseFloat(currencyInputModal.value) || 0;
            const rate = currency.buy; // Usamos el valor de compra como tasa
            const result = currencyValue * rate;
            currencyToVesResult.textContent = `Bs ${formatNumberVES(result)}`;
        });
        
        // Mostrar el modal
        modal.style.display = 'block';
    }

    // Función para calcular una sola tarjeta
    function calculateSingle(currency, cardElement) {
        const inputValue = parseFloat(document.getElementById('currency-input').value) || 1;
        
        // Actualizar los valores con animación
        if (currency.buy !== null && currency.buy !== undefined) {
            const buyElement = cardElement.querySelector('.buy-value');
            if (buyElement) {
                const buyValue = currency.buy * inputValue;
                animateValue(buyElement, parseFloat(buyElement.textContent.replace('Bs ', '').replace('M', '000000').replace('K', '000').replace(',', '')), buyValue, 500);
            }
        }
        
        if (currency.sell !== null && currency.sell !== undefined) {
            const sellElement = cardElement.querySelector('.sell-value');
            if (sellElement) {
                const sellValue = currency.sell * inputValue;
                animateValue(sellElement, parseFloat(sellElement.textContent.replace('Bs ', '').replace('M', '000000').replace('K', '000').replace(',', '')), sellValue, 500);
            }
        }
    }

    // Función para calcular todas las tarjetas
    function calculateAll(currencyData) {
        const inputValue = parseFloat(document.getElementById('currency-input').value) || 1;
        
        // Actualizar todas las tarjetas de Dólar General
        currencyData.general.forEach(currency => {
            const cards = document.querySelectorAll('#general-cards .card');
            cards.forEach(card => {
                if (card.querySelector('.card-title').textContent.trim() === currency.name) {
                    if (currency.buy !== null && currency.buy !== undefined) {
                        const buyElement = card.querySelector('.buy-value');
                        if (buyElement) {
                            const buyValue = currency.buy * inputValue;
                            animateValue(buyElement, parseFloat(buyElement.textContent.replace('Bs ', '').replace('M', '000000').replace('K', '000').replace(',', '')), buyValue, 500);
                        }
                    }
                    
                    if (currency.sell !== null && currency.sell !== undefined) {
                        const sellElement = card.querySelector('.sell-value');
                        if (sellElement) {
                            const sellValue = currency.sell * inputValue;
                            animateValue(sellElement, parseFloat(sellElement.textContent.replace('Bs ', '').replace('M', '000000').replace('K', '000').replace(',', '')), sellValue, 500);
                        }
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
                element.textContent = `Bs ${formatNumberVES(end)}`;
                clearInterval(timer);
            } else {
                element.textContent = `Bs ${formatNumberVES(current)}`;
            }
        }, 16);
    }

    // Evento para el botón "Calcular todos"
    document.getElementById('calculate-all-btn').addEventListener('click', function() {
        fetchCurrencyData().then(data => {
            if (data) {
                const processedData = processCurrencyData(data);
                calculateAll(processedData);
            }
        });
    });

    // Evento para el input (calcular al presionar Enter)
    document.getElementById('currency-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchCurrencyData().then(data => {
                if (data) {
                    const processedData = processCurrencyData(data);
                    calculateAll(processedData);
                }
            });
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

    // Cargar los datos al iniciar la página
    fetchCurrencyData().then(data => {
        if (data) {
            const processedData = processCurrencyData(data);
            createCards(processedData);
        }
    });
});