const cartContainer = document.getElementById("cartContainer");

// CALCULATE SUBTOTAL
function calculateSubtotal(item){
    let subtotal = 0;
    const mealCount = item.mealCount || 0;
    const orders = item.orders || [];
    const plan = item.plan;
    const planData = item.planData || JSON.parse(sessionStorage.getItem("planData") || "{}");
    if(!planData[plan]) return 0;

    orders.forEach(combo=>{
        if(combo.Protein){
            const extraPrices = {Steak:3.5, Salmon:3.5, Shrimp:2, Bison:2, Carnitas:2};
            subtotal += combo.Protein.reduce((acc,val)=>acc+(extraPrices[val]||0),0) * (mealCount===10?mealCount/2:mealCount);
        }
        if(combo.Extras){
            subtotal += combo.Extras.length * 1.5 * (mealCount===10?mealCount/2:mealCount);
        }
    });

    const basePrice = mealCount===10 ? planData[plan].price10 : planData[plan].price5;
    subtotal += basePrice;
    return subtotal;
}

// RENDER CART
function renderCart(){
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    cartContainer.innerHTML = "";

    if(cart.length === 0){
        cartContainer.innerHTML = "<p style='font-size:1.1rem; color:#555; text-align:center;'>Your cart is empty.</p>";
        return;
    }

    let grandSubtotal = 0;

    cart.forEach((item,index)=>{
        const freshSubtotal = calculateSubtotal(item);
        grandSubtotal += freshSubtotal;

        const div = document.createElement("div");
        div.className = "cart-card";

        let html = `
            <div class="cart-title">Order ${index+1}</div>
            <div class="cart-meta">
                <span><b>Plan:</b> ${item.plan}</span>
                <span><b>Meals:</b> ${item.mealCount}</span>
                <span><b>Combinations:</b> ${item.orders.length}</span>
            </div>
            <hr class="cart-divider">
        `;

        item.orders.forEach((combo,i)=>{
            html += `<div class="combo-block">
                        <div class="combo-title">Combo ${i+1}</div>`;
            if(combo.Protein?.length) html += `<div class="combo-item"><b>Protein:</b> ${combo.Protein.join(", ")}</div>`;
            if(combo.Vegetables?.length) html += `<div class="combo-item"><b>Vegetables:</b> ${combo.Vegetables.join(", ")}</div>`;
            if(combo.Carbohydrates?.length) html += `<div class="combo-item"><b>Carbohydrates:</b> ${combo.Carbohydrates.join(", ")}</div>`;
            if(combo.Extras?.length) html += `<div class="combo-item"><b>Extras:</b> ${combo.Extras.join(", ")}</div>`;
            html += `</div>`;
        });

        html += `
            <hr class="cart-divider">
            <div class="cart-subtotal">Subtotal: $${freshSubtotal.toFixed(2)}</div>
        `;

        div.innerHTML = html;

        // ✅ REMOVE BUTTON (FIXED)
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => removeItem(index));
        div.appendChild(removeBtn);

        cartContainer.appendChild(div);
    });

    // TOTAL SUMMARY
    const tax = grandSubtotal * 0.075;
    const total = grandSubtotal + tax;

    const totalDiv = document.createElement("div");
    totalDiv.className = "cart-summary";
    totalDiv.innerHTML = `
        <h2>Order Summary</h2>
        <div class="summary-row"><span>Subtotal:</span> <span>$${grandSubtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Taxes (+7.5%):</span> <span>$${tax.toFixed(2)}</span></div>
        <div class="summary-row total-row"><span>Total:</span> <span>$${total.toFixed(2)}</span></div>
    `;
    cartContainer.appendChild(totalDiv);

// BUTTON ROW CONTAINER
const buttonRow = document.createElement("div");
buttonRow.className = "button-row";

// CONTINUE ORDERING BUTTON
const continueBtn = document.createElement("a");
continueBtn.href = "index.html";
continueBtn.className = "checkout-btn continue-btn";
continueBtn.textContent = "Continue Ordering";

// CHECKOUT BUTTON (JS)
const checkoutBtn = document.createElement("button");
checkoutBtn.className = "checkout-btn";
checkoutBtn.textContent = "Checkout";

checkoutBtn.onclick = () => {
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    sessionStorage.setItem("checkoutCart", JSON.stringify(cart));
    window.location.href = "checkout_page.html";
};

// ADD BUTTONS TO ROW (checkout left, continue right)
buttonRow.appendChild(checkoutBtn);
buttonRow.appendChild(continueBtn);

// APPEND BUTTON ROW TO CART
cartContainer.appendChild(buttonRow);
}

// REMOVE ITEM
function removeItem(index){
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    if(index < 0 || index >= cart.length) return;

    cart.splice(index, 1);

    sessionStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("checkoutCart", JSON.stringify(cart));

    renderCart();
}

renderCart();