async function loadOffers() {
  try {
    const response = await fetch("assets/data/offers.json");
    const data = await response.json();

    const container = document.getElementById("offersContainer");

    container.innerHTML = data
      .map(
        (offer) => `
            <div class="offer-card">
                <div class="app-logo">
                    <img src="${offer.image}">
                </div>
                <div class="app-name">${offer.name}</div>
                <div class="offer-code">
                    <span class="code">${offer.code}</span>
                    <button class="copy-btn" onclick="copyCode('${offer.code}', this)">نسخ</button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error:", error);
  }
}

function copyCode(code, btn) {
  navigator.clipboard.writeText(code);

  btn.innerText = "تم";
  btn.classList.add("copied");

  setTimeout(() => {
    btn.innerText = "نسخ";
    btn.classList.remove("copied");
  }, 2000);
}
loadOffers();
