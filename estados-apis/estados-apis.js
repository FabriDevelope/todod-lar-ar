document.addEventListener('DOMContentLoaded', function() {
    // Configuración de las APIs a monitorear
    const apis = [

        {
            name: 'Argentina',
            flag: 'https://flagcdn.com/w320/ar.png',
            url: 'https://dolarapi.com/v1/estado',
            endpoint: 'https://dolarapi.com/v1/dolares'
        },
        {
            name: 'Venezuela',
            flag: 'https://flagcdn.com/w320/ve.png',
            url: 'https://ve.dolarapi.com/v1/estado',
            endpoint: 'https://ve.dolarapi.com/v1/dolares'
        },
        {
            name: 'Uruguay',
            flag: 'https://flagcdn.com/w320/uy.png',
            url: 'https://uy.dolarapi.com/v1/estado',
            endpoint: 'https://uy.dolarapi.com/v1/cotizaciones'
        },
        {
            name: 'Chile',
            flag: 'https://flagcdn.com/w320/cl.png',
            url: 'https://cl.dolarapi.com/v1/estado',
            endpoint: 'https://cl.dolarapi.com/v1/cotizaciones'
        }
    ];

    // Elementos del DOM
    const apiCardsContainer = document.getElementById('api-cards-container');
    const refreshBtn = document.getElementById('refresh-btn');
    const lastUpdateTime = document.getElementById('last-update-time');
    const totalApisElement = document.getElementById('total-apis');
    const onlineApisElement = document.getElementById('online-apis');
    const offlineApisElement = document.getElementById('offline-apis');

    // Función para obtener el estado de una API
    async function fetchApiStatus(api) {
        try {
            console.log(`Verificando estado de la API de ${api.name}: ${api.url}`);
            const response = await fetch(api.url);
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Estado de la API de ${api.name}:`, data);
            
            return {
                ...api,
                status: 'online',
                data: data,
                lastChecked: new Date()
            };
        } catch (error) {
            console.error(`Error al verificar el estado de la API de ${api.name}:`, error);
            
            return {
                ...api,
                status: 'offline',
                error: error.message,
                lastChecked: new Date()
            };
        }
    }

    // Función para obtener el estado de todas las APIs
    async function fetchAllApisStatus() {
        // Mostrar indicador de carga
        refreshBtn.classList.add('loading');
        apiCardsContainer.innerHTML = '<div class="loading">Cargando estados de APIs...</div>';
        
        try {
            // Obtener el estado de todas las APIs en paralelo
            const promises = apis.map(api => fetchApiStatus(api));
            const results = await Promise.all(promises);
            
            // Actualizar la interfaz con los resultados
            renderApiCards(results);
            updateSummary(results);
            updateLastCheckedTime();
            
            return results;
        } catch (error) {
            console.error('Error al obtener los estados de las APIs:', error);
            
            // Mostrar mensaje de error
            apiCardsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No se pudieron cargar los estados de las APIs.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
            
            return [];
        } finally {
            // Quitar indicador de carga
            refreshBtn.classList.remove('loading');
        }
    }

    // Función para renderizar las tarjetas de estado de las APIs
    function renderApiCards(apisStatus) {
        apiCardsContainer.innerHTML = '';
        
        apisStatus.forEach(api => {
            const card = createApiCard(api);
            apiCardsContainer.appendChild(card);
        });
    }

    // Función para crear una tarjeta de estado de API
    function createApiCard(api) {
        const card = document.createElement('div');
        card.className = `api-card ${api.status}`;
        
        // Formatear la fecha de última verificación
        const lastCheckedFormatted = api.lastChecked.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Construir el HTML de la tarjeta
        let cardHTML = `
            <div class="api-header">
                <div class="country-flag">
                    <img src="${api.flag}" alt="${api.name}">
                </div>
                <div class="country-info">
                    <h3 class="country-name">${api.name}</h3>
                    <p class="api-url">${api.endpoint}</p>
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
        
        // Agregar detalles específicos si la API está online
        if (api.status === 'online' && api.data) {
            if (api.data.estado) {
                cardHTML += `
                    <div class="api-detail">
                        <span class="api-detail-label">Estado:</span>
                        <span class="api-detail-value">${api.data.estado}</span>
                    </div>
                `;
            }
            
            if (api.data.fechaActualizacion) {
                const updateDate = new Date(api.data.fechaActualizacion);
                const updateDateFormatted = updateDate.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                cardHTML += `
                    <div class="api-detail">
                        <span class="api-detail-label">Última actualización:</span>
                        <span class="api-detail-value">${updateDateFormatted}</span>
                    </div>
                `;
            }
            
            if (api.data.version) {
                cardHTML += `
                    <div class="api-detail">
                        <span class="api-detail-label">Versión:</span>
                        <span class="api-detail-value">${api.data.version}</span>
                    </div>
                `;
            }
            
            if (api.data.mensajes) {
                cardHTML += `
                    <div class="api-detail">
                        <span class="api-detail-label">Mensajes:</span>
                        <span class="api-detail-value">${api.data.mensajes}</span>
                    </div>
                `;
            }
        } else if (api.status === 'offline' && api.error) {
            cardHTML += `
                <div class="api-detail">
                    <span class="api-detail-label">Error:</span>
                    <span class="api-detail-value">${api.error}</span>
                </div>
            `;
        }
        
        cardHTML += `
            </div>
        `;
        
        card.innerHTML = cardHTML;
        return card;
    }

    // Función para actualizar el resumen
    function updateSummary(apisStatus) {
        const totalApis = apisStatus.length;
        const onlineApis = apisStatus.filter(api => api.status === 'online').length;
        const offlineApis = totalApis - onlineApis;
        
        totalApisElement.textContent = totalApis;
        onlineApisElement.textContent = onlineApis;
        offlineApisElement.textContent = offlineApis;
    }

    // Función para actualizar la hora de última verificación
    function updateLastCheckedTime() {
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        lastUpdateTime.textContent = timeFormatted;
    }

    // Evento para el botón de actualización
    refreshBtn.addEventListener('click', fetchAllApisStatus);

    // Cargar los estados al iniciar la página
    fetchAllApisStatus();
    
    // Configurar actualización automática cada 5 minutos
    setInterval(fetchAllApisStatus, 5 * 60 * 1000);
});