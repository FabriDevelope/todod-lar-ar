document.addEventListener('DOMContentLoaded', function() {
    const currencyData = {
        steam: [
            { name: 'Dólar Steam', buy: 1669.80, sell: null, spread: null, change: 0.36, icon: 'fa-gamepad"' },
            { name: 'Dólar Netflix', buy: 2083.80, sell: null, spread: null, change: 0.36, icon: 'fa-play-circle' }
        ],
        general: [],
        euro: []
    };

    let updateInterval = 60000; // default 1 minuto
    let updateTimer;
    let progress = 0;
    let progressBarTimer;

    // 🔹 Renombrar según tipo/pais
        function renameCurrency(d) {
            if(d.casa) {
                const name = d.casa.toLowerCase();
                if(name.includes('blue')) return 'Dólar Blue';
                if(name.includes('tarjeta')) return 'Dólar Tarjeta';
                if(name.includes('mep')) return 'Dólar MEP';
                if(name.includes('ccl')) return 'Dólar CCL';
                if(name.includes('cripto')) return 'Dólar Cripto';
                if(name.includes('mayorista')) return 'Dólar Mayorista';
                if(name.includes('futuro')) return 'Dólar Futuro';
                if(name.includes('oficial')) return 'Oficial (' + d.moneda + ')'; // ← aquí
                if(name.includes('euro')) return 'Euro'; 
                if(name.includes('liqui')) return 'Contado Con Liquidación';
                return d.casa.charAt(0).toUpperCase() + d.casa.slice(1);
            }
            return 'Moneda';
        }


    // 🔹 Crear todas las cards
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

    // 🔹 Crear card individual
    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';
        let titleColor = type === 'steam' ? 'var(--accent-color)' : type === 'euro' ? '#2ecc71' : 'var(--primary-color)';

        let cardHTML = `<h3 class="card-title" style="color:${titleColor}"><i class="fas ${currency.icon}"></i> ${currency.name}</h3><div class="card-values">`;

        if(currency.buy !== null) cardHTML += `<div class="card-value"><span>Compra:</span><span class="buy-value">$${currency.buy.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}</span></div>`;
        if(currency.sell !== null) cardHTML += `<div class="card-value"><span>Venta:</span><span class="sell-value">$${currency.sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}</span></div>`;
        if(currency.spread !== null) cardHTML += `<div class="card-spread"><span>Spread:</span><span>$${currency.spread.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}</span></div>`;
        if(currency.change !== null){
            const changeClass = currency.change>=0?'positive':'negative';
            const changeSymbol = currency.change>=0?'+':'';
            cardHTML += `<div class="card-change"><span>Cambio:</span><span class="${changeClass}">${changeSymbol}${currency.change.toFixed(2)}%</span></div>`;
        }

        cardHTML += `</div><button class="card-btn" data-currency="${encodeURIComponent(JSON.stringify(currency))}"><i class="fas fa-calculator"></i> Calcular</button>`;
        card.innerHTML = cardHTML;

        const btn = card.querySelector('.card-btn');
        btn.addEventListener('click', () => openCalcModal(currency));

        return card;
    }

    // 🔹 Modal de calculadora
    function openCalcModal(currency){
        const modal = document.getElementById('calc-modal');
        const modalTitle = document.getElementById('modal-title');
        const currencyName = document.getElementById('currency-name');
        const currencyName2 = document.getElementById('currency-name-2');
        modalTitle.textContent = `Calculadora de ${currency.name}`;
        currencyName.textContent = currency.name;
        currencyName2.textContent = currency.name;

        const arsInput = document.getElementById('ars-input');
        const currencyInputModal = document.getElementById('currency-input-modal');
        const arsToCurrencyResult = document.getElementById('ars-to-currency-result').querySelector('.result-value');
        const currencyToArsResult = document.getElementById('currency-to-ars-result').querySelector('.result-value');

        const arsToCurrencyBtn = document.getElementById('ars-to-currency-btn');
        const currencyToArsBtn = document.getElementById('currency-to-ars-btn');

        arsToCurrencyResult.textContent = '0.00';
        currencyToArsResult.textContent = '$0.00';
        arsInput.value = '';
        currencyInputModal.value = '';

        arsToCurrencyBtn.onclick = () => {
            const arsValue = parseFloat(arsInput.value)||0;
            const result = arsValue / currency.buy;
            arsToCurrencyResult.textContent = result.toFixed(2);
        };

        currencyToArsBtn.onclick = () => {
            const val = parseFloat(currencyInputModal.value)||0;
            const result = val*currency.buy;
            currencyToArsResult.textContent = `$${result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`;
        };

        modal.style.display = 'block';
    }

    document.getElementById('modal-close-btn').addEventListener('click', ()=> document.getElementById('calc-modal').style.display='none');
    document.getElementById('modal-close-footer-btn').addEventListener('click', ()=> document.getElementById('calc-modal').style.display='none');
    window.addEventListener('click', e=>{if(e.target===document.getElementById('calc-modal')) document.getElementById('calc-modal').style.display='none';});

    // 🔹 Animación de valores
    function animateValue(element,start,end,duration){
        if(start===end) return;
        const range=end-start;
        const increment=range/(duration/16);
        let current=start;
        const timer=setInterval(()=>{
            current+=increment;
            if((increment>0 && current>=end)||(increment<0 && current<=end)){
                element.textContent=`$${end.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`;
                clearInterval(timer);
            }else{
                element.textContent=`$${current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`;
            }
        },16);
    }

    // 🔹 Calcular todos
    document.getElementById('calculate-all-btn').addEventListener('click', ()=>{
        const inputValue = parseFloat(document.getElementById('currency-input').value)||1;
        document.querySelectorAll('.card').forEach(card=>{
            const currency = JSON.parse(decodeURIComponent(card.querySelector('.card-btn').getAttribute('data-currency')));
            const buyEl = card.querySelector('.buy-value');
            const sellEl = card.querySelector('.sell-value');
            if(buyEl) animateValue(buyEl, parseFloat(buyEl.textContent.replace('$','').replace(/,/g,'')), currency.buy*inputValue, 500);
            if(sellEl && currency.sell) animateValue(sellEl, parseFloat(sellEl.textContent.replace('$','').replace(/,/g,'')), currency.sell*inputValue, 500);
        });
    });

    document.getElementById('currency-input').addEventListener('keypress', e=>{
        if(e.key==='Enter') document.getElementById('calculate-all-btn').click();
    });

    // 🔹 Fetch API y actualizar
    async function fetchCurrencyData(){
        try{
            const resDollar = await fetch('https://dolarapi.com/v1/dolares');
            const dolarData = await resDollar.json();
            currencyData.general = dolarData.map(d=>{
                return {
                    name: renameCurrency(d),
                    buy: parseFloat(d.compra),
                    sell: parseFloat(d.venta),
                    spread: d.venta?parseFloat(d.venta)-parseFloat(d.compra):null,
                    change:null,
                    icon: d.casa.toLowerCase().includes('blue')?'fa-dollar-sign':'fa-landmark'
                };
            });

            const resOther = await fetch('https://dolarapi.com/v1/cotizaciones');
            const otherData = await resOther.json();
            currencyData.euro = otherData.map(d=>{
                return {
                    name: `${d.casa} (${d.moneda})`,
                    buy: parseFloat(d.compra),
                    sell: parseFloat(d.venta),
                    spread: d.venta?parseFloat(d.venta)-parseFloat(d.compra):null,
                    change:null,
                    icon: d.casa.toLowerCase().includes('euro')?'fa-euro-sign':'fa-money-bill'
                };
            });

            createCards();
            resetProgressBar();
        }catch(e){console.error('Error API:',e);}
    }

    // 🔹 Barra de actualización
    const updateBar = document.getElementById('update-bar');
    const updateText = document.getElementById('update-text');

    function startProgressBar(){
        clearInterval(progressBarTimer);
        progress = 0;
        const step = 100 / (updateInterval / 100);
        progressBarTimer = setInterval(()=>{
            progress += step;
            if(progress>=100) progress=100;
            updateBar.style.width = progress+'%';
        },100);
    }

    function resetProgressBar(){
        startProgressBar();
    }

    // 🔹 Selector de intervalo
    const selectInterval = document.getElementById('update-interval-select');
    selectInterval.addEventListener('change', ()=>{
        updateInterval = parseInt(selectInterval.value);
        updateText.textContent = `Actualización cada ${Math.floor(updateInterval/60000)} minuto(s)`;
        clearInterval(updateTimer);
        fetchCurrencyData();
        updateTimer = setInterval(fetchCurrencyData, updateInterval);
    });

    updateText.textContent = `Actualización cada ${Math.floor(updateInterval/60000)} minuto(s)`;
    fetchCurrencyData();
    updateTimer = setInterval(fetchCurrencyData, updateInterval);
});
