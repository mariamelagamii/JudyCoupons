let allOffers = [];
let selectedMain = "المتاجر"; // يطابق الزر النشط أول ما تفتح الصفحة
let selectedSub = "all";
let searchText = "";
let shown = 0;
let current = [];
const PAGE = 48; // كم كوبون يظهر كل مرة

// ترتيب الأقسام الفرعية للمتاجر (أي قسم جديد في البيانات يظهر قبل «آخرى»)
const SUB_ORDER = [
  "الأزياء", "العطور والعود", "العناية والتجميل", "المجوهرات والاكسسوارات", "الكترونيات",
  "العسل والتمور", "القهوه والمحاصيل", "الأغذية", "الديكور والاضاءه", "الأطفال والألعاب",
  "الصحة والعيادات", "الرياضة واللياقة", "التعليم", "المنتجات الرقميه والاشتراكات",
  "السيارات", "الحيوانات الأليفة", "الطباعة والقرطاسية", "الهدايا والورود",
  "خدمات حكوميه وللمتاجر", "آخرى",
];

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadOffers() {
  const res = await fetch("assets/data/offers.json", { cache: "no-cache" });
  allOffers = await res.json();
  buildSubButtons();
  filterData();
}

function buildSubButtons() {
  const box = document.getElementById("categories");
  const counts = {};
  allOffers
    .filter((o) => o.mainCategory === "المتاجر")
    .forEach((o) => (counts[o.subCategory || "آخرى"] = (counts[o.subCategory || "آخرى"] || 0) + 1));
  const subs = Object.keys(counts).sort((a, b) => {
    const ia = SUB_ORDER.indexOf(a), ib = SUB_ORDER.indexOf(b);
    if (a === "آخرى") return 1;
    if (b === "آخرى") return -1;
    return (ia < 0 ? 98 : ia) - (ib < 0 ? 98 : ib);
  });
  box.innerHTML =
    `<button class="active" data-sub="all">الكل</button>` +
    subs.map((s) => `<button data-sub="${esc(s)}">${esc(s)}</button>`).join("");
  box.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      box.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSub = btn.dataset.sub;
      filterData();
    });
  });
}

function card(offer) {
  const link = offer.link || "https://judymarketing.com/";
  const img = offer.image
    ? `<img src="${esc(offer.image)}" alt="${esc(offer.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/images/salla-logo.svg'">`
    : `<img src="assets/images/salla-logo.svg" alt="${esc(offer.name)}" loading="lazy">`;
  const code = offer.code
    ? `<span class="code">${esc(offer.code)}</span>
       <button type="button" class="copy-btn" data-code="${esc(offer.code)}">نسخ</button>`
    : `<a class="copy-btn" href="${esc(link)}" target="_blank" rel="noopener">زيارة</a>`;
  return `
  <div class="offer-card">
      <div class="app-logo">
          <a href="${esc(link)}" target="_blank" rel="noopener">${img}</a>
      </div>
      <div class="app-name">${esc(offer.name)}</div>
      <div class="offer-code">${code}</div>
  </div>`;
}

function displayOffers(data) {
  current = data;
  shown = 0;
  const container = document.getElementById("offersContainer");
  container.innerHTML = data.length ? "" : "<p>لا يوجد كوبونات</p>";
  showMore();
}

function showMore() {
  const container = document.getElementById("offersContainer");
  const next = current.slice(shown, shown + PAGE);
  container.insertAdjacentHTML("beforeend", next.map(card).join(""));
  shown += next.length;
  const more = document.getElementById("loadMore");
  if (more) {
    more.style.display = shown < current.length ? "block" : "none";
    more.textContent = `عرض المزيد (${current.length - shown})`;
  }
}

function filterData() {
  let filtered = allOffers.filter((o) => o.mainCategory === selectedMain);
  if (selectedMain === "المتاجر" && selectedSub !== "all") {
    filtered = filtered.filter((o) => (o.subCategory || "آخرى") === selectedSub);
  }
  if (searchText) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter((o) => String(o.name || "").toLowerCase().includes(q));
  }
  displayOffers(filtered);
}

/* Main buttons */
document.querySelectorAll(".main-categories button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".main-categories button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMain = btn.dataset.main;
    selectedSub = "all";
    document.querySelectorAll("#categories button").forEach((b) => b.classList.toggle("active", b.dataset.sub === "all"));
    document.getElementById("subWrapper").style.display = selectedMain === "المتاجر" ? "flex" : "none";
    filterData();
  });
});

/* Search */
const searchBox = document.getElementById("offerSearch");
if (searchBox) {
  let t;
  searchBox.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      searchText = searchBox.value.trim();
      filterData();
    }, 200);
  });
}

/* Load more */
const moreBtn = document.getElementById("loadMore");
if (moreBtn) moreBtn.addEventListener("click", showMore);

/* Scroll */
const categories = document.getElementById("categories");
document.getElementById("scrollLeft").onclick = () => categories.scrollBy({ left: -200, behavior: "smooth" });
document.getElementById("scrollRight").onclick = () => categories.scrollBy({ left: 200, behavior: "smooth" });

/* Copy */
document.getElementById("offersContainer").addEventListener("click", (e) => {
  const btn = e.target.closest("button.copy-btn");
  if (!btn) return;
  navigator.clipboard
    .writeText(btn.dataset.code)
    .then(() => {
      btn.innerText = "تم";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerText = "نسخ";
        btn.classList.remove("copied");
      }, 2000);
    })
    .catch((err) => console.error("Failed to copy: ", err));
});

function copyCodeSalla(code, btn) {
  navigator.clipboard.writeText(code);
  btn.innerHTML = 'تم نسخ الكود <i class="fa-solid fa-clipboard-check"></i>';
  btn.classList.add("copied");
  setTimeout(() => {
    btn.innerHTML = 'نسخ الكود <i class="fa-regular fa-copy"></i>';
    btn.classList.remove("copied");
  }, 2000);
}
// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();
// Scroll to top button
const scrollBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 400) scrollBtn.classList.add("show");
  else scrollBtn.classList.remove("show");
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
// Load offers on page load
loadOffers();
