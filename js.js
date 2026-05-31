let cart = [];

// إضافة صنف للسلة
function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    updateCartUI();
    console.log("تمت إضافة " + name + " إلى السلة!");
}

// فتح السلة
function openCart() {
    document.getElementById('cart-modal').showModal();
    updateCartUI();
}

// تحديث واجهة السلة
function updateCartUI() {
    let container = document.getElementById('cart-items');
    container.innerHTML = "";

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                       onchange="updateQty(${index}, this.value)">
                <button class="remove-btn" onclick="removeItem(${index})">حذف</button>
            </div>
        `;
    });

    let countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// تحديث الكمية
function updateQty(index, val) {
    let newQty = parseInt(val);
    if (newQty > 0) {
        cart[index].quantity = newQty;
    } else {
        removeItem(index);
    }
    updateCartUI();
}

// حذف صنف
function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// إظهار حقل اسم المحل
function showFields() {
    if(cart.length === 0) return alert("السلة فارغة!");
    document.getElementById('user-info').style.display = 'block';
    let btn = document.getElementById('confirm-btn');
    btn.innerText = "تأكيد وإرسال الطلبات 📱";
    btn.onclick = sendToWhatsApp;
}

// دالة الإرسال (واتساب بدون إجمالي)
function sendToWhatsApp() {
    let shopName = document.getElementById('shop-name').value;
    if (shopName === "") {
        alert("من فضلك اكتب اسم المحل!");
        return;
    }
    
    let message = `طلب جديد من: ${shopName}\n\nالطلبات:\n` + 
                  cart.map(i => `• ${i.name} (العدد: ${i.quantity})`).join('\n');
    
    window.open("https://wa.me/201281525050?text=" + encodeURIComponent(message));
}
