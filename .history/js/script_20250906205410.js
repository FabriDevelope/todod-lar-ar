const usdInput = document.getElementById("usdInput");
const resultContainer = document.getElementById("resultContainer");

const dolares = [
  {name:"Dólar Oficial", buy:1340, sell:1380, spread:40, change:0.36, section:"general"},
  {name:"Oficial Bancos", buy:1344.41, sell:1386.8, spread:42.39, change:0.30, section:"general"},
  {name:"Dólar Blue", buy:1350, sell:1370, spread:20, change:0.37, section:"general"},
  {name:"Dólar Tarjeta", buy:1794, sell:1794, spread:null, change:0.36, section:"general"},
  {name:"Dólar Netflix", buy:2083.8, sell:2083.8, spread:null, change:0.36, section:"juegos"},
  {name:"Dólar Gamer", buy:1669.8, sell:1669.8, spread:null, change:0.36, section:"juegos"},
  {name:"Dólar MEP", buy:1383.33, sell:1383.33, spread:null, change:0.36, section:"general"},
  {name:"Dólar CCL", buy:1385.55, sell:1385.55, spread:null, change:0.52, section:"general"},
  {name:"Dólar Cripto", buy:1381.99, sell:1394.2, spread:12.21, change:0.31, section:"general"},
  {name:"Dólar Mayorista", buy:1346, sell:1355, spread:9, change:-0.55, section:"general"},
  {name:"Dólar Futuro", buy:1391, sell:1394, spread:3, change:0, section:"general"}
];

function renderAll() {
  const usd = parseFloat(usdInput.value) || 0;
  resultContainer.innerHTML = "";

  dolares.forEach(d => {
    renderTarjeta(d, usd);
  });
}

function renderTarjeta(d, usd) {
  const div = document.createElement("div");
  div.classList.add("tarjeta");
  div.innerHTML = `
    <h3>${d.name}</h3>
    <p>% cambio: ${d.change}%</p>
    <p>Compra: $${(usd*d.buy).toFixed(2)}</p>
    <p>Venta: $${(usd*d.sell).toFixed(2)}</p>
    ${d.spread ? `<p>Spread: $${d.spread}</p>` : ""}
    <button onclick="calcSingle(${d.buy}, ${d.sell})">Calcular</button>
  `;
  resultContainer.appendChild(div);
}

function calcSingle(buy, sell) {
  const usd = parseFloat(usdInput.value) || 0;
  alert(`Compra: $${(usd*buy).toFixed(2)}\nVenta: $${(usd*sell).toFixed(2)}`);
}

document.getElementById("calcAll").addEventListener("click", renderAll);
