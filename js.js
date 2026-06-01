let cart = [];

// إضافة صنف للسلة
function addToCart(name, price) {
    showToast();
    let clickSound =new Audio('click.mp3')
    clickSound.play();
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
// في بداية ملف js.js، قم بتهيئة EmailJS


function sendToWhatsApp() {
    let shopName = document.getElementById('shop-name').value;
    if (shopName === "") {
        alert("من فضلك اكتب اسم المحل!");
        return;
    }
    
    // تجهيز البيانات
    let cartDetails = cart.map(i => `• ${i.name} (العدد: ${i.quantity})`).join('\n');
    
    // إرسال الإيميل
    (function(){
   emailjs.init("3xKGgYOdYgVChJOsh");
})();
    emailjs.send('service_n44lkxg', 'template_s3kgnc8', {
        shop_name: shopName,
        cart_details: cartDetails
    }).then(function() {
        alert("تم إرسال الطلب بنجاح!");
        cart = []; // تفريغ السلة
        updateCartUI();
        document.getElementById('cart-modal').close();
    }, function(error) {
        alert("فشل الإرسال، حاول مرة أخرى.");
        console.log("خطأ:", error);
    });
}


document.addEventListener("mousemove", (e) => {
    const cards = document.querySelectorAll('.a1');
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        // حساب موقع الماوس بالنسبة لكل كارت
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // إرسال الإحداثيات لملف الـ CSS
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});



//رسالة تم الضافة الي لسلة بنجاح
function showToast() {
    let toast = document.getElementById("toast");
    toast.classList.add("show"); // إظهار الملاحظة

    // إخفاء الملاحظة بعد 3 ثوانٍ
    setTimeout(function() {
        toast.classList.remove("show");
    }, 3000);
}



