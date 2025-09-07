document.addEventListener('DOMContentLoaded', function() {
    const apiUrlBR = 'https://br.dolarapi.com/v1/cotacoes';
    const currencyData = {
        geral: []
    };
    const updateInterval = 60000; // 1 minuto
    let updateTimer;

    // 🔹 Buscar e processar dados do Brasil
    async function fetchCurrencyData() {
        try {
            const res = await fetch(apiUrlBR);
            const data = await res.json();
            console.log('Dados API Brasil:', data);

            currencyData.geral = data.map(d => {
                const buy = parseFloat(d.compra) || 0;
                const sell = parseFloat(d.venda) || 0;
                const spread = sell - buy;

                return {
                    nome: d.nome,
                    buy: buy,
                    sell: sell,
                    spread: spread,
                    fechoAnterior: d.fechoAnterior || null,
                    icon: d.moeda === 'USD' ? 'fa-dollar-sign' :
                          d.moeda === 'EUR' ? 'fa-euro-sign' :
                          d.moeda === 'ARS' ? 'fa-money-bill-wave' :
                          d.moeda === 'CLP' ? 'fa-coins' :
                          d.moeda === 'UYU' ? 'fa-landmark' :
                          'fa-money-bill'
                };
            });

            criarCards();
            resetProgressBar();
        } catch (e) {
            console.error('Erro na API Brasil:', e);
        }
    }

    // 🔹 Criar cards
    function criarCards() {
        const geralContainer = document.getElementById('general-cards');
        geralContainer.innerHTML = '';
        currencyData.geral.forEach(c => geralContainer.appendChild(criarCard(c)));
    }

    function criarCard(currency) {
        const card = document.createElement('div');
        card.className = 'card';
        let titleColor = 'var(--primary-color)';

        const cardHTML = `
            <h3 class="card-title" style="color:${titleColor}">
                <i class="fas ${currency.icon}"></i> ${currency.nome}
            </h3>
            <div class="card-values">
                <div class="card-value"><span>Compra:</span><span class="buy-value">R$ ${currency.buy.toFixed(4)}</span></div>
                <div class="card-value"><span>Venda:</span><span class="sell-value">R$ ${currency.sell.toFixed(4)}</span></div>
                <div class="card-spread"><span>Spread:</span><span>R$ ${currency.spread.toFixed(4)}</span></div>
            </div>
            <button class="card-btn" data-currency="${encodeURIComponent(JSON.stringify(currency))}">
                <i class="fas fa-calculator"></i> Calcular
            </button>
        `;
        card.innerHTML = cardHTML;

        card.querySelector('.card-btn').addEventListener('click', () => abrirCalcModal(currency));
        return card;
    }

    // 🔹 Modal
    function abrirCalcModal(currency){
        const modal = document.getElementById('calc-modal');
        const modalTitle = document.getElementById('modal-title');
        const currencyName = document.getElementById('currency-name');
        const currencyName2 = document.getElementById('currency-name-2');
        modalTitle.textContent = `Calculadora de ${currency.nome}`;
        currencyName.textContent = currency.nome;
        currencyName2.textContent = currency.nome;

        const brlInput = document.getElementById('ves-input');
        const currencyInputModal = document.getElementById('currency-input-modal');
        const brlToCurrencyResult = document.getElementById('ves-to-currency-result').querySelector('.result-value');
        const currencyToBrlResult = document.getElementById('currency-to-ves-result').querySelector('.result-value');

        const brlToCurrencyBtn = document.getElementById('ves-to-currency-btn');
        const currencyToBrlBtn = document.getElementById('currency-to-ves-btn');

        brlToCurrencyResult.textContent = '0.00';
        currencyToBrlResult.textContent = 'R$ 0.00';
        brlInput.value = '';
        currencyInputModal.value = '';

        brlToCurrencyBtn.onclick = () => {
            const brlValue = parseFloat(brlInput.value)||0;
            brlToCurrencyResult.textContent = (brlValue / currency.buy).toFixed(2);
        };
        currencyToBrlBtn.onclick = () => {
            const val = parseFloat(currencyInputModal.value)||0;
            const result = val * currency.buy;
            currencyToBrlResult.textContent = `R$ ${result.toFixed(2)}`;
        };

        modal.style.display = 'block';
    }

    document.getElementById('modal-close-btn').addEventListener('click', ()=> modal.style.display='none');
    document.getElementById('modal-close-footer-btn').addEventListener('click', ()=> modal.style.display='none');

    // 🔹 Barra de atualização
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

    // 🔹 Executar fetch e auto-update
    fetchCurrencyData();
    updateTimer = setInterval(fetchCurrencyData, updateInterval);
});
