document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const amountInput = document.getElementById('amount');
    const calculateAllBtn = document.getElementById('calculate-all');
    const cards = document.querySelectorAll('.card');
    
    // Valores hardcodeados de las monedas
    const exchangeRates = {
        'steam': {
            type: 'single',
            value: 1669.80
        },
        'netflix': {
            type: 'single',
            value: 2083.80
        },
        'oficial': {
            type: 'buy-sell',
            buy: 1340.00,
            sell: 1380.00
        },
        'bancos': {
            type: 'buy-sell',
            buy: 1344.41,
            sell: 1386.80
        },
        'blue': {
            type: 'buy-sell',
            buy: 1350.00,
            sell: 1370.00
        },
        'tarjeta': {
            type: 'single',
            value: 1794.00
        },
        'mep': {
            type: 'single',
            value: 1383.33
        },
        'ccl': {
            type: 'single',
            value: 1385.55
        },
        'cripto': {
            type: 'buy-sell',
            buy: 1381.99,
            sell: 1394.20
        },
        'mayorista': {
            type: 'buy-sell',
            buy: 1346.00,
            sell: 1355.00
        },
        'futuro': {
            type: 'buy-sell',
            buy: 1391.00,
            sell: 1394.00
        },
        'euro-oficial': {
            type: 'buy-sell',
            buy: 1484.00,
            sell: 1507.00
        },
        'euro-blue': {
            type: 'buy-sell',
            buy: 1478.00,
            sell: 1489.00
        }
    };
    
    // Función para calcular una tarjeta específica
    function calculateCard(card) {
        const cardType = card.getAttribute('data-type');
        const resultElement = card.querySelector('.result-amount');
        const amount = parseFloat(amountInput.value) || 0;
        
        if (amount <= 0) {
            resultElement.textContent = '0.00';
            return;
        }
        
        const rate = exchangeRates[cardType];
        let result;
        
        if (rate.type === 'single') {
            result = amount * rate.value;
        } else {
            // Usamos el valor de venta para el cálculo
            result = amount * rate.sell;
        }
        
        resultElement.textContent = result.toFixed(2);
    }
    
    // Función para calcular todas las tarjetas
    function calculateAllCards() {
        cards.forEach(card => {
            calculateCard(card);
        });
    }
    
    // Event listeners
    calculateAllBtn.addEventListener('click', calculateAllCards);
    
    // Event listener para los botones individuales de cada tarjeta
    cards.forEach(card => {
        const calculateBtn = card.querySelector('.calculate-btn');
        calculateBtn.addEventListener('click', function() {
            calculateCard(card);
        });
    });
    
    // Event listener para el input (calcular al presionar Enter)
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateAllCards();
        }
    });
});