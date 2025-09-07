document.addEventListener('DOMContentLoaded', async function() {
    // 🔹 Datos iniciales (hardcodeados por si falla el fetch)
    const currencyData = {
        steam: [
            { name: 'Dólar Steam', buy: 1669.80, sell: null, spread: null, change: 0.36, icon: 'fa-gamepad' },
            { name: 'Dólar Netflix', buy: 2083.80, sell: null, spread: null, change: 0.36, icon: 'fa-tv' }
        ],
        general: [
            { name: 'Dólar Oficial', buy: 1340, sell: 1380, spread: 40, change: 0.36, icon: 'fa-landmark' },
            { name: 'Oficial Bancos', buy: 1344.41, sell: 1386.8, spread: 42.39, change: 0.30, icon: 'fa-university' },
            { name: 'Dólar Blue', buy: 1350, sell: 1370, spread: 20, change: 0.37, icon: 'fa-dollar-sign' },
            { name: 'Dólar Tarjeta', buy: 1794, sell: null, spread: null, change: 0.36, icon: 'fa-credit-card' },
            { name: 'Dólar MEP', buy: 1383.33, sell: null, spread: null, change: 0.36, icon: 'fa-chart-line' },
            { name: 'Dólar CCL', buy: 1385.55, sell: null, spread: null, change: 0.52, icon: 'fa-briefcase' },
            { name: 'Dólar Cripto', buy: 1381.99, sell: 1394.2, spread: 12.21, change: 0.31, icon: 'fa-bitcoin' },
            { name: 'Dólar Mayorista', buy: 1346, sell: 1355, spread: 9, change: -0.55, icon: 'fa-handshake' },
            { name: 'Dólar Futuro', buy: 1391, sell: 1394, spread: 3, change: 0, icon: 'fa-calendar-alt' }
        ],
        euro: [
            { name: 'Euro Oficial', buy: 1484, sell: 1507, spread: null, change: null, icon: 'fa-euro-sign' },
            { name: 'Euro Blue', buy: 1478, sell: 1489, spread: null, change: null, icon: 'fa-euro-sign' }
        ]
    };

    // 🔹 Función para traer datos dinámicos desde Dolarito
    async function fetchDolaritoData() {
        try {
            const url = encodeURIComponent("https://dolarito.ar");
            const res = await fetch(`https://api.allorigins.win/get?url=${url}`);
            const data = await res.json();
            const doc = new DOMParser().parseFromString(data.contents, "text/html");

            // 🔹 Mapear todos los valores de dólar automáticamente
            const mappings = [
                { selector: ".dolar-oficial .buy", name: "Dólar Oficial" },
                { selector: ".dolar-oficial .sell", name: "Dólar Oficial" },
                { selector: ".dolar-blue .buy", name: "Dólar Blue" },
                { selector: ".dolar-blue .sell", name: "Dólar Blue" },
                { selector: ".dolar-tarjeta .buy", name: "Dólar Tarjeta" },
                { selector: ".dolar-mep .buy", name: "Dólar MEP" },
                { selector: ".dolar-ccl .buy", name: "Dólar CCL" },
                { selector: ".dolar-cripto .buy", name: "Dólar Cripto" },
                { selector: ".dolar-mayorista .buy", name: "Dólar Mayorista" },
                { selector: ".dolar-futuro .buy", name: "Dólar Futuro" }
            ];

            mappings.forEach(m => {
                const elem = doc.querySelector(m.selector);
                if (elem) {
                    const val = parseFloat(elem.textContent.replace(/[^\d.,]/g,"").replace(",", "."));
                    const item = currencyData.general.find(c => c.name === m.name);
                    if (item) item.buy = val;
                }
            });

            console.log("✅ Datos actualizados desde Dolarito");
        } catch (err) {
            console.error("❌ Error al traer datos de Dolarito:", err);
        }
    }

    // 🔹 Función para formatear números con separador de miles
    function formatNumber(num) {
        return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // 🔹 Funciones para crear tarjetas
    function createCards() {
        const steamContainer = document.getElementById('steam-cards');
        const generalContainer = document.getElementById('general-cards');
        const euroContainer = document.getElementById('euro-cards');

        steamContainer.innerHTML = "";
        generalContainer.innerHTML = "";
        euroContainer.innerHTML = "";

        currencyData.steam.forEach(c => steamContainer.appendChild(createCard(c,'steam')));
        currencyData.general.forEach(c => generalContainer.appendChild(createCard(c,'general')));
        currencyData.euro.forEach(c => euroContainer.appendChild(createCard(c,'euro')));
    }

    function createCard(currency, type) {
        const card = document.createElement('div');
        card.className = 'card';

        let titleColor = 'var(--primary-color)';
        if(type==='steam') titleColor='var(--accent-color)';
        else if(type==='euro') titleColor='#2ecc71';

        let html = `<h3 class="card-title" style="color:${titleColor}">
                        <i class="fas ${currency.icon}"></i> ${currency.name}
                    </h3>
                    <div class="card-values">`;

        if(currency.buy!==null) html+=`<div class="card-value"><span>Compra:</span> <span class="buy-value">$${formatNumber(currency.buy)}</span></div>`;
        if(currency.sell!==null) html+=`<div class="card-value"><span>Venta:</span> <span class="sell-value">$${formatNumber(currency.sell)}</span></div>`;
        if(currency.spread!==null) html+=`<div class="card-spread"><span>Spread:</span> <span>$${formatNumber(currency.spread)}</span></div>`;
        if(currency.change!==null){
            const cClass = currency.change>=0?'positive':'negative';
            const cSym = currency.change>=0?'+':'';
            html+=`<div class="card-change"><span>Cambio:</span> <span class="${cClass}">${cSym}${currency.change.toFixed(2)}%</span></div>`;
        }
        html+=`</div>
               <button class="card-btn" data-currency='${encodeURIComponent(JSON.stringify(currency))}'>
                    <i class="fas fa-calculator"></i> Calcular
               </button>`;

        card.innerHTML = html;

        card.querySelector('.card-btn').addEventListener('click', function(){
            const cur = JSON.parse(decodeURIComponent(this.getAttribute('data-currency')));
            openCalcModal(cur);
        });

        return card;
    }

    // 🔹 Modal
    function openCalcModal(currency){
        const modal=document.getElementById('calc-modal');
        document.getElementById('modal-title').textContent=`Calculadora de ${currency.name}`;

        const arsInput = document.getElementById('ars-input');
        const currencyInput = document.getElementById('currency-input-modal');
        const arsResult = document.getElementById('ars-to-currency-result').querySelector('.result-value');
        const curResult = document.getElementById('currency-to-ars-result').querySelector('.result-value');

        document.getElementById('ars-to-currency-btn').onclick=()=>{ 
            const val = parseFloat(arsInput.value)||0; 
            arsResult.textContent=(val/currency.buy).toFixed(2); 
        };
        document.getElementById('currency-to-ars-btn').onclick=()=>{
            const val = parseFloat(currencyInput.value)||0;
            curResult.textContent=`$${(val*currency.buy).toFixed(2)}`;
        };

        modal.style.display='block';
    }

    document.getElementById('modal-close-btn').onclick=
    document.getElementById('modal-close-footer-btn').onclick=()=>document.getElementById('calc-modal').style.display='none';
    window.onclick=e=>{ if(e.target===document.getElementById('calc-modal')) document.getElementById('calc-modal').style.display='none'; };

    // 🔹 Animación de valores
    function animateValue(el,start,end,duration=500){
        if(start===end) return;
        const range=end-start;
        const increment=range/(duration/16);
        let current=start;
        const timer=setInterval(()=>{
            current+=increment;
            if((increment>0 && current>=end)||(increment<0 && current<=end)){
                el.textContent=`$${formatNumber(end)}`;
                clearInterval(timer);
            }else{
                el.textContent=`$${formatNumber(current)}`;
            }
        },16);
    }

    // 🔹 Calcular todos
    document.getElementById('calculate-all-btn').addEventListener('click',()=>{
        document.querySelectorAll('.card').forEach(card=>{
            const cur = JSON.parse(decodeURIComponent(card.querySelector('.card-btn').getAttribute('data-currency')));
            if(cur.buy!==null){
                const buyEl = card.querySelector('.buy-value');
                animateValue(buyEl,parseFloat(buyEl.textContent.replace('$','').replace(',','')),cur.buy);
            }
        });
    });

    // 🔹 Inicializar: fetch + creación de tarjetas
    await fetchDolaritoData();
    createCards();

    // 🔹 Actualización automática cada minuto
    setInterval(async()=>{
        await fetchDolaritoData();
        createCards();
    },60000);
});
