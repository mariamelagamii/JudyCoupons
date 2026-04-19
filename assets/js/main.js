let allOffers = [];
let selectedMain = "all";
let selectedSub = "all";

async function loadOffers() {
  const res = await fetch("assets/data/offers.json");
  allOffers = await res.json();
  displayOffers(allOffers);
}

function displayOffers(data) {
  const container = document.getElementById("offersContainer");

  if (data.length === 0) {
    container.innerHTML = "<p>لا يوجد كوبونات</p>";
    return;
  }

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
}

function filterData() {
  let filtered = [...allOffers];

  if (selectedMain !== "all") {
    filtered = filtered.filter((o) => o.mainCategory === selectedMain);
  }

  if (selectedMain === "المتاجر" && selectedSub !== "all") {
    filtered = filtered.filter((o) => o.subCategory === selectedSub);
  }

  displayOffers(filtered);
}

/* Main buttons */
document.querySelectorAll(".main-categories button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".main-categories button")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    selectedMain = btn.dataset.main;
    selectedSub = "all";

    const subWrapper = document.getElementById("subWrapper");

    if (selectedMain === "المتاجر") {
      subWrapper.style.display = "flex";
    } else {
      subWrapper.style.display = "none";
    }

    filterData();
  });
});

/* Sub buttons */
document.querySelectorAll(".sub-categories button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".sub-categories button")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    selectedSub = btn.dataset.sub;

    filterData();
  });
});

/* Scroll */
const categories = document.getElementById("categories");

document.getElementById("scrollLeft").onclick = () => {
  categories.scrollBy({ left: -200, behavior: "smooth" });
};

document.getElementById("scrollRight").onclick = () => {
  categories.scrollBy({ left: 200, behavior: "smooth" });
};

/* Copy */
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
