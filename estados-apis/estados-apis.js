document.addEventListener('DOMContentLoaded', function() {
    // Configuración de las APIs a monitorear
    const apis = [
        {
            name: 'Argentina',
            flag: 'https://flagcdn.com/w320/ar.png',
            url: 'https://dolarapi.com/v1/estado',
            endpoints: [
                'https://dolarapi.com/v1/ambito/dolares',
                'https://dolarapi.com/v1/dolares/oficial'
            ]
        },
        {
            name: 'Uruguay',
            flag: 'https://flagcdn.com/w320/uy.png',
            url: 'https://uy.dolarapi.com/v1/estado',
            endpoints: ['https://uy.dolarapi.com/v1/cotizaciones']
        },
        {
            name: 'Chile',
            flag: 'https://flagcdn.com/w320/cl.png',
            url: 'https://cl.dolarapi.com/v1/estado',
            endpoints: ['https://cl.dolarapi.com/v1/cotizaciones']
        },
        {
            name: 'Venezuela',
            flag: 'https://flagcdn.com/w320/ve.png',
            url: 'https://ve.dolarapi.com/v1/estado',
            endpoints: ['https://ve.dolarapi.com/v1/dolares']
        }
    ];

    // Elementos del DOM
    const apiCardsContainer = document.getElementById('api-cards-container');
    const refreshBtn = document.getElementById('refresh-btn');
    const lastUpdateTime = document.getElementById('last-update-time');
    const totalApisElement = document.getElementById('total-apis');
    const onlineApisElement = document.getElementById('online-apis');
    const offlineApisElement = document.getElementById('offline-apis');

    // Función para obtener el estado de una API (soporta múltiples endpoints)
    async function fetchApiStatus(api) {
        let combinedData = [];
        let status = 'online';
        let errorMessage = '';

        for (const endpoint of api.endpoints) {
            try {
                console.log(`Verificando endpoint de ${api.name}: ${endpoint}`);
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                combinedData.push({ endpoint, data });
            } catch (error) {
                console.error(`Error al verificar el endpoint de ${api.name}: ${endpoint}`, error);
                status = 'offline';
                errorMessage = error.message;
            }
        }

        return {
            ...api,
            status,
            data: combinedData,
            lastChecked: new Date(),
            error: status === 'offline' ? errorMessage : null
        };
    }

    // Función para obtener el estado de todas las APIs
    async function fetchAllApisStatus() {
        refreshBtn.classList.add('loading');
        apiCardsContainer.innerHTML = '<div class="loading">Cargando estados de APIs...</div>';

        try {
            const promises = apis.map(api => fetchApiStatus(api));
            const results = await Promise.all(promises);

            renderApiCards(results);
            updateSummary(results);
            updateLastCheckedTime();

            return results;
        } catch (error) {
            console.error('Error al obtener los estados de las APIs:', error);
            apiCardsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudieron cargar los estados de las APIs.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
            return [];
        } finally {
            refreshBtn.classList.remove('loading');
        }
    }

    // Función para renderizar las tarjetas
    function renderApiCards(apisStatus) {
        apiCardsContainer.innerHTML = '';

        apisStatus.forEach(api => {
            const card = createApiCard(api);
            apiCardsContainer.appendChild(card);
        });
    }

    // Función para crear tarjeta de API
    function createApiCard(api) {
        const card = document.createElement('div');
        card.className = `api-card ${api.status}`;

        const lastCheckedFormatted = api.lastChecked.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        let cardHTML = `
            <div class="api-header">
                <div class="country-flag">
                    <img src="${api.flag}" alt="${api.name}">
                </div>
                <div class="country-info">
                    <h3 class="country-name">${api.name}</h3>
                    <p class="api-url">${api.endpoints.join('<br>')}</p>
                </div>
            </div>
            
            <div class="api-status">
                <span class="status-label">Estado:</span>
                <span class="status-value ${api.status}">
                    <i class="fas ${api.status === 'online' ? 'fa-check-circle' : 'fa-times-circle'} status-icon"></i>
                    ${api.status === 'online' ? 'Online' : 'Offline'}
                </span>
            </div>

            <div class="api-details">
                <div class="api-detail">
                    <span class="api-detail-label">Última verificación:</span>
                    <span class="api-detail-value">${lastCheckedFormatted}</span>
                </div>
        `;

        if (api.status === 'online' && api.data) {
            api.data.forEach(item => {
                if (item.data.estado) {
                    cardHTML += `
                        <div class="api-detail">
                            <span class="api-detail-label">Estado endpoint:</span>
                            <span class="api-detail-value">${item.data.estado}</span>
                        </div>
                    `;
                }
                if (item.data.fechaActualizacion) {
                    const updateDate = new Date(item.data.fechaActualizacion);
                    const updateDateFormatted = updateDate.toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                    });
                    cardHTML += `
                        <div class="api-detail">
                            <span class="api-detail-label">Última actualización:</span>
                            <span class="api-detail-value">${updateDateFormatted}</span>
                        </div>
                    `;
                }
            });
        } else if (api.status === 'offline' && api.error) {
            cardHTML += `
                <div class="api-detail">
                    <span class="api-detail-label">Error:</span>
                    <span class="api-detail-value">${api.error}</span>
                </div>
            `;
        }

        cardHTML += `</div>`;
        card.innerHTML = cardHTML;
        return card;
    }

    function updateSummary(apisStatus) {
        const totalApis = apisStatus.length;
        const onlineApis = apisStatus.filter(api => api.status === 'online').length;
        const offlineApis = totalApis - onlineApis;

        totalApisElement.textContent = totalApis;
        onlineApisElement.textContent = onlineApis;
        offlineApisElement.textContent = offlineApis;
    }

    function updateLastCheckedTime() {
        const now = new Date();
        lastUpdateTime.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    refreshBtn.addEventListener('click', fetchAllApisStatus);

    // Inicializar
    fetchAllApisStatus();
    setInterval(fetchAllApisStatus, 5 * 60 * 1000);
});
