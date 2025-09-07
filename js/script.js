document.addEventListener('DOMContentLoaded', function() {
    // Animación de entrada para las tarjetas de países
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});