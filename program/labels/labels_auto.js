import { db } from '../firebase_config.js';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const ordersRef = collection(db, "orders");

onSnapshot(ordersRef, snapshot => {
  const orders = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  renderOrders(orders);
});

function renderOrders(orders) {
  const notPrintedEl = document.getElementById("not-printed-list");
  const printedEl = document.getElementById("printed-list");

  notPrintedEl.innerHTML = "";
  printedEl.innerHTML = "";

  orders.forEach(order => {
    const div = document.createElement("div");
    div.className = "order-card";

    div.innerHTML = `<span>${order.client?.name || "No Name"}</span>`;

    if (order.printed) {
      printedEl.appendChild(div);
    } else {
      const btn = document.createElement("button");
      btn.textContent = "Print";

      btn.onclick = () => handlePrint(order.id);

      div.appendChild(btn);
      notPrintedEl.appendChild(div);
    }
  });
}

// ---------------- MAPPING ----------------

function mapProtein(name) {
  const map = {
    "Grilled Chicken": "chicken",
    "Ground Turkey": "turkey",
    "Breast Turkey": "turkey",
    "Steak": "beef",
    "Grilled Shrimp": "shrimp",
    "Salmon": "salmon",
    "Bison": "bison",
    "Carnitas": "pork"
  };
  return map[name] || name?.toLowerCase();
}

function mapCarb(name) {
  const map = {
    "White Rice": "white rice",
    "Brown Rice": "brown rice",
    "Sweet Potato": "sweet potato",
    "Quinoa": "quinoa",
    "Colliflower Rice": "cauliflower"
  };
  return map[name] || name?.toLowerCase();
}

function mapVeggies(arr) {
  if (!arr || arr.length === 0) return "";

  if (arr.length > 1) return "veggies.";

const map = {
  "Broccoli": "broccoli",
  "Zucchini": "zucchini",
  "Green Beans": "green beans",
  "Cabbage": "cabbage",
  "Asparagus": "asparagus",
  "Cucumber": "cucumber",
  "Carrots": "carrot",
  "Lettuce": "lettuce",
  "Tomatoes": "tomatoes",
  "Mushrooms": "mushrooms"
};

  const v = arr[0];

  return map[v] || v.toLowerCase();
}

// ---------------- MACROS ----------------

function getMacros(plan) {
  if (plan === "Stay Healthy") return { protein: 5, carbs: 3.5, veggies: 3.5 };
  if (plan === "Weight Loss") return { protein: 4, carbs: 3, veggies: 3.5 };
  if (plan === "Bulking") return { protein: 6, carbs: 4, veggies: 4 };
  return { protein: 0, carbs: 0, veggies: 0 };
}

// ---------------- PRINT ----------------

async function handlePrint(orderId) {
  const ref = doc(db, "orders", orderId);
  const snap = await getDoc(ref);
  const order = snap.data();

  const labels = [];

  const isCart = Array.isArray(order.orders) && order.orders[0]?.orders;

if (isCart) {
  order.orders.forEach(item => {
    const macros = getMacros(item.plan);
    const combos = item.orders;
    const mealsPerCombo = Math.floor(item.mealCount / combos.length);
    const remainder = item.mealCount % combos.length;

    combos.forEach((combo, index) => {
      const protein = mapProtein(combo.Protein?.[0]);
      const carbs = mapCarb(combo.Carbohydrates?.[0]);
      const veggies = mapVeggies(combo.Vegetables || combo.Veggies || []);

      const count = mealsPerCombo + (index < remainder ? 1 : 0);

      for (let i = 0; i < count; i++) {
        labels.push({ protein, carbs, veggies, macros });
      }
    });
  });
} else {
  const macros = getMacros(order.plan);
  const combos = order.orders;
  const mealsPerCombo = Math.floor(order.mealCount / combos.length);
  const remainder = order.mealCount % combos.length;

  combos.forEach((combo, index) => {
    const protein = mapProtein(combo.Protein?.[0]);
    const carbs = mapCarb(combo.Carbohydrates?.[0]);
    const veggies = mapVeggies(combo.Vegetables || combo.Veggies || []);

    const count = mealsPerCombo + (index < remainder ? 1 : 0);

    for (let i = 0; i < count; i++) {
      labels.push({ protein, carbs, veggies, macros });
    }
  });
}

  await printLabels(labels);

  await updateDoc(ref, { printed: true });
}

// ---------------- USE YOUR FORM ----------------

async function printLabels(labels) {
  const form = document.getElementById("nutritionForm");
  const result = document.getElementById("result");

  let html = "";

  for (let i = 0; i < labels.length; i++) {
    const l = labels[i];

    form.protein.value = l.protein;
    form.protein_ounces.value = l.macros.protein;
    form.carbohydrate.value = l.carbs;
    form.carbohydrate_ounces.value = l.macros.carbs;
    form.vegetable.value = l.veggies;
    form.vegetable_ounces.value = l.macros.veggies;

    form.dispatchEvent(new Event("submit"));

    await new Promise(r => setTimeout(r, 50));

    html += `
      <div class="label">
        ${result.innerHTML}
      </div>
    `;
  }

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
    <head>
      <title>Print Labels</title>
      <style>
        @page {
          size: 2in 3.1in;
          margin: 0;
        }

        body {
          margin: 0;
          padding: 0;
        }

        .label {
          width: 2in;
          height: 3.05in;
          box-sizing: border-box;
          padding: 0.1in;
          page-break-after: always;
        }

        .label:last-child {
          page-break-after: auto;
        }

        img {
          width: 1.3in;
          height: 1.2in;
          display: block;
          margin: 0 auto 10px auto;
        }

        p, h2 {
          margin: 2px 0;
          font-size: 12px;
          text-align: left;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 100);
}