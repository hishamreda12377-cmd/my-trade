let cart = [];

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

function openCart() {
    document.getElementById('cart-modal').showModal();
    updateCartUI();
}

function updateCartUI() {
    let container = document.getElementById('cart-items');
    container.innerHTML = "";

    cart.forEach((item, index) => {
        // حافظنا على كلاساتك: cart-item, quantity-input, remove-btn
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

function updateQty(index, val) {
    let newQty = parseInt(val);
    if (newQty > 0) {
        cart[index].quantity = newQty;
    } else {
        removeItem(index);
    }
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function sendToWhatsApp() {
    // جلب البيانات الجديدة
    let userName = document.getElementById('user-name').value;
    let shopName = document.getElementById('shop-name').value;

    if (userName === "" || shopName === "") {
        alert("من فضلك أدخل اسمك واسم المحل");
        return;
    }

    if(cart.length === 0) return alert("السلة فارغة!");
    
    let message = `طلب جديد:\n👤 الاسم: ${userName}\n🏪 المحل: ${shopName}\n\nالطلبات:\n` + 
                  cart.map(i => `• ${i.name} (العدد: ${i.quantity})`).join('\n');
    
    window.open("https://wa.me/201281525050?text=" + encodeURIComponent(message));
}


// دالة إظهار خانة اسم المحل
function showFields() {
    if(cart.length === 0) return alert("السلة فارغة!");
    
    // إظهار الخانة
    document.getElementById('user-info').style.display = 'block';
    
    // تغيير نص الزر
    let btn = document.getElementById('confirm-btn');
    btn.innerText = "تأكيد وإرسال للواتساب 📱";
    
    // تغيير وظيفة الزر للإرسال الفعلي
    btn.onclick = sendToWhatsApp;
}

// دالة الإرسال النهائية
function sendToWhatsApp() {
    let shopName = document.getElementById('shop-name').value;

    if (shopName === "") {
        alert("من فضلك اكتب اسم المحل!");
        return;
    }

    let message = `طلب جديد:\n🏪 اسم المحل: ${shopName}\n\nالطلبات:\n` + 
                  cart.map(i => `• ${i.name} (العدد: ${i.quantity})`).join('\n');
    
    window.open("https://wa.me/201281525050?text=" + encodeURIComponent(message));
}
