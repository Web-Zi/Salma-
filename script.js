// Default initial category list (stored in LocalStorage to allow Admin dynamic edits)
const defaultCategories = [
    {
        name: "قائمة 1 (أساسي)",
        items: [
            "سكر", "بن فاتح سادة", "بن فاتح محوج", "بن غامق محوج", "بن بندق",
            "اسبرسو", "تست", "كراسون", "تشيز كيك", "اكلير", "ملفاي",
            "براونز", "دوناتس", "عجينة وافل", "عجينة كباكي", "ساندوتش ميكس جبن تركي",
            "كوب دوناتس", "غطاء دوناتس", "فاكهة حشو فراولة", "فاكهة حشو عنب بري"
        ]
    },
    {
        name: "قائمة 2 (المشروبات)",
        items: [
            "كوفي ميكس", "نسكافيه بلاك", "بنجورنو بندق", "بنجورنو فانيليا", "لاتيه",
            "لاتيه كرمَل", "موكه", "هوت شوكلت برباك", "هوت شوكلت كابري", "هوت ميلك موز",
            "هوت ميلك فراولة", "هوت ميلك توت", "بطاطا بودر", "شاي السلام", "احمد تي قرنفل",
            "شاي لبتون", "شاي فواكه", "شاي اخضر", "جنجبيل ليمون", "ينسون", "نعناع", "كركديه"
        ]
    },
    {
        name: "قائمة 3 (الحلويات والصوصات)",
        items: [
            "شيكولاته وايت", "شيكولاته براون", "شيكولاته كندر", "شيكولاته لوتس", "شيكولاته بندق",
            "صوص كرمَل", "صوص درك", "صوص كوكيز", "صوص بندق", "صوص جوز هند",
            "صوص فراولة", "كريم باستري", "اضافة بندق مبشور", "اضافة مرشملو",
            "جالون اوريو", "جالون لوتس", "علبة كيري", "علبة جلاكسي", "علبة مندولين",
            "قرنفل حبوب", "جوز هند خشن"
        ]
    },
    {
        name: "قائمة 4 (الأكواب والمستلزمات)",
        items: [
            "كوب سخن ٤", "كوب سخن ٧", "كوب سخن ٨", "كوب سخن ١٢", "غطاء سخن",
            "كوب ساقعان ١٠", "كوب ساقعان ١٢", "كوب ساقعان ١٦", "كوب صين داي",
            "غطاء ساقعان", "علب وافل M", "علب وافل L", "علب وافل XL",
            "جراب بوست", "جراب أيس كريم", "ورق زيدة", "سندضة بلاستيك",
            "شاليموه", "معالق", "شوكة", "سكينة", "أكياس كراش", "اطباق فوم"
        ]
    },
    {
        name: "قائمة 5 (المستلزمات العامة)",
        items: [
            "مكسرات سحلب", "عصير تفاح", "زبيب", "قرفة عيدان", "سحلب",
            "فانيليا", "بيكينج بودر", "زبده", "كرتونة مياه", "بالتة ردبل",
            "مناديل", "بكر استريتش", "باليتة تشيز كيك", "علبة كرواسون",
            "دقيق", "زيت", "مفرش سفرة", "بكر كاشير", "لبن"
        ]
    },
    {
        name: "قائمة 6 (المخزون العام)",
        items: [
            "مخزون عام 1", "مخزون عام 2", "مخزون عام 3", "مخزون عام 4", "مخزون عام 5"
        ]
    }
];

function getCategories() {
    const saved = localStorage.getItem('salma_categories_config');
    return saved ? JSON.parse(saved) : defaultCategories;
}

let categories = getCategories();
let currentCategoryIndex = 0;
let isReceivedUnlocked = false;
let isDeliveredUnlocked = false;

function getBranchInfo() {
    return {
        name: localStorage.getItem('salma_branch_name') || "فرع غير معروف",
        phone: localStorage.getItem('salma_branch_phone') || "01000000000"
    };
}

function getPasswords() {
    return {
        received: localStorage.getItem('salma_pass_rec') || "1234",
        delivered: localStorage.getItem('salma_pass_del') || "5678",
        admin: localStorage.getItem('salma_pass_adm') || "0000"
    };
}

let pendingUnlockType = null;

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.getElementById("splash-screen").style.opacity = "0";
        setTimeout(() => {
            document.getElementById("splash-screen").classList.add("hidden");
            document.getElementById("app-container").classList.remove("hidden");
        }, 500);
    }, 2000);

    updateBranchTag();
    renderTabs();
    renderTable();
    loadSavedData();
});

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
}

function updateBranchTag() {
    const branch = getBranchInfo();
    document.getElementById('branch-display-tag').innerText = `فرع: ${branch.name}`;
}

function renderTabs() {
    const wrapper = document.getElementById("tabs-wrapper");
    wrapper.innerHTML = "";
    categories.forEach((cat, idx) => {
        const btn = document.createElement("button");
        btn.className = `tab-btn ${idx === currentCategoryIndex ? 'active' : ''}`;
        btn.innerText = cat.name;
        btn.onclick = () => switchCategory(idx);
        wrapper.appendChild(btn);
    });
}

function switchCategory(index) {
    saveCurrentCategoryState();
    currentCategoryIndex = index;
    isReceivedUnlocked = false;
    isDeliveredUnlocked = false;
    renderTabs();
    renderTable();
    loadSavedData();
}

function renderTable() {
    const tbody = document.getElementById("inventory-body");
    tbody.innerHTML = "";

    const currentCat = categories[currentCategoryIndex];
    document.getElementById("category-title").innerText = currentCat.name;

    document.getElementById("lock-icon-rec").innerText = isReceivedUnlocked ? "🔓" : "🔒";
    document.getElementById("lock-icon-del").innerText = isDeliveredUnlocked ? "🔓" : "🔒";

    const todayStr = new Date().toISOString().split('T')[0];

    currentCat.items.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="item-name">${item}</td>
            <td><input type="date" id="date_${index}" value="${todayStr}"></td>
            <td><input type="number" id="rec_${index}" value="0" min="0" 
                class="${isReceivedUnlocked ? '' : 'locked-input'}" 
                ${isReceivedUnlocked ? '' : 'readonly'} 
                oninput="calculateTotal(${index})"></td>
            <td><input type="number" id="new_${index}" value="0" min="0" oninput="calculateTotal(${index})"></td>
            <td><input type="number" id="del_${index}" value="0" min="0" 
                class="${isDeliveredUnlocked ? '' : 'locked-input'}" 
                ${isDeliveredUnlocked ? '' : 'readonly'} 
                oninput="calculateTotal(${index})"></td>
            <td><input type="number" id="tot_${index}" value="0" class="total-field" readonly></td>
            <td><input type="text" id="note_${index}" placeholder="..."></td>
        `;

        tbody.appendChild(row);
    });
}

function requestColumnUnlock(type) {
    pendingUnlockType = type;
    const title = type === 'received' ? 'فتح تعديل عمود (مستلم)' : 'فتح تعديل عمود (مسلم)';
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-prompt-text').innerText = 'أدخل كلمة المرور لفتح/قفل العمود بالكامل:';
    document.getElementById('modal-password-input').value = "";
    document.getElementById('password-modal').style.display = "flex";
    document.getElementById('modal-password-input').focus();
}

function verifyPasswordAction() {
    const enteredPass = document.getElementById('modal-password-input').value;
    const pws = getPasswords();
    const targetPass = pendingUnlockType === 'received' ? pws.received : pws.delivered;

    if (enteredPass === targetPass) {
        if (pendingUnlockType === 'received') {
            isReceivedUnlocked = !isReceivedUnlocked;
        } else {
            isDeliveredUnlocked = !isDeliveredUnlocked;
        }
        closePasswordModal();
        saveCurrentCategoryState();
        renderTable();
        loadSavedData();
    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = "none";
    pendingUnlockType = null;
}

function calculateTotal(index) {
    const received = parseFloat(document.getElementById(`rec_${index}`).value) || 0;
    const newStock = parseFloat(document.getElementById(`new_${index}`).value) || 0;
    const delivered = parseFloat(document.getElementById(`del_${index}`).value) || 0;
    document.getElementById(`tot_${index}`).value = (newStock + received) - delivered;
}

function saveCurrentCategoryState() {
    const currentCat = categories[currentCategoryIndex];
    const data = [];
    currentCat.items.forEach((item, index) => {
        if (document.getElementById(`rec_${index}`)) {
            data.push({
                item: item,
                rowDate: document.getElementById(`date_${index}`).value || "",
                received: document.getElementById(`rec_${index}`).value || 0,
                newStock: document.getElementById(`new_${index}`).value || 0,
                delivered: document.getElementById(`del_${index}`).value || 0,
                total: document.getElementById(`tot_${index}`).value || 0,
                note: document.getElementById(`note_${index}`).value || ""
            });
        }
    });
    localStorage.setItem(`salma_cat_${currentCategoryIndex}`, JSON.stringify(data));
}

function loadSavedData() {
    const saved = localStorage.getItem(`salma_cat_${currentCategoryIndex}`);
    if (saved) {
        const reportData = JSON.parse(saved);
        reportData.forEach((data, index) => {
            if (document.getElementById(`rec_${index}`)) {
                document.getElementById(`date_${index}`).value = data.rowDate || "";
                document.getElementById(`rec_${index}`).value = data.received;
                document.getElementById(`new_${index}`).value = data.newStock;
                document.getElementById(`del_${index}`).value = data.delivered;
                document.getElementById(`tot_${index}`).value = data.total;
                document.getElementById(`note_${index}`).value = data.note;
            }
        });
    }
}

// Export All Categories and Send Report Payload to HQ App
async function handleSaveAndExport() {
    saveCurrentCategoryState();
    const branch = getBranchInfo();

    if (!confirm(`هل أنت متأكد من حفظ وتصدير تقرير الجرد لـ (${branch.name}) وإرساله للفرع الرئيسي؟`)) return;

    const workbook = XLSX.utils.book_new();
    const todayStr = new Date().toISOString().split('T')[0];

    categories.forEach((cat, catIdx) => {
        let reportData = [];
        const saved = localStorage.getItem(`salma_cat_${catIdx}`);

        if (saved) {
            reportData = JSON.parse(saved);
        } else {
            reportData = cat.items.map(item => ({
                item: item, rowDate: todayStr, received: 0, newStock: 0, delivered: 0, total: 0, note: ""
            }));
        }

        const formattedData = reportData.map(row => ({
            "الصنف": row.item,
            "التاريخ": row.rowDate,
            "مستلم": Number(row.received),
            "جديد": Number(row.newStock),
            "مسلم": Number(row.delivered),
            "العدد": Number(row.total),
            "ملاحظات": row.note
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        worksheet['!views'] = [{ rightToLeft: true }];
        XLSX.utils.book_append_sheet(workbook, worksheet, `قائمة ${catIdx + 1}`);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Save Local Excel Copy
    const downloadUrl = URL.createObjectURL(excelBlob);
    const fileName = `Inventory_${branch.name}_${todayStr}.xlsx`;

    // Construct Payload URL/Message for HQ Receiver App
    const reportPayload = {
        branchName: branch.name,
        phone: branch.phone,
        date: todayStr,
        excelFileName: fileName,
        downloadUrl: downloadUrl
    };

    const whatsappMessage = encodeURIComponent(
        `📌 *تقرير جرد جديد - سلمى كافيه*\n` +
        `🏢 *الفرع:* ${branch.name}\n` +
        `📞 *الهاتف:* ${branch.phone}\n` +
        `📅 *التاريخ:* ${todayStr}\n` +
        `📁 *الملف:* ${fileName}\n\n` +
        `رابط البلاغ التلقائي للفرع الرئيسي: salmahq://receive?data=${encodeURIComponent(JSON.stringify(reportPayload))}`
    );

    // Open WhatsApp / Share intent
    window.location.href = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

    // Reset local cache
    categories.forEach((_, catIdx) => localStorage.removeItem(`salma_cat_${catIdx}`));
    isReceivedUnlocked = false;
    isDeliveredUnlocked = false;
    renderTable();
    alert("تم حفظ الجرد وتجهيز الرسالة للفرع الرئيسي بنجاح!");
}

// Admin Modal Actions
function openAdminModal() {
    document.getElementById('admin-master-input').value = "";
    document.getElementById('admin-login-view').style.display = "block";
    document.getElementById('admin-settings-view').style.display = "none";
    document.getElementById('admin-modal').style.display = "flex";
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = "none";
}

function verifyAdminLogin() {
    const enteredPass = document.getElementById('admin-master-input').value;
    const pws = getPasswords();

    if (enteredPass === pws.admin) {
        document.getElementById('admin-login-view').style.display = "none";
        document.getElementById('admin-settings-view').style.display = "block";

        const branch = getBranchInfo();
        document.getElementById('branch-name-edit').value = branch.name;
        document.getElementById('branch-phone-edit').value = branch.phone;

        document.getElementById('pass-received-edit').value = pws.received;
        document.getElementById('pass-delivered-edit').value = pws.delivered;
        document.getElementById('pass-admin-edit').value = pws.admin;

        // Populate Category Select dropdown for adding items
        const select = document.getElementById('add-item-category-select');
        select.innerHTML = "";
        categories.forEach((cat, idx) => {
            select.innerHTML += `<option value="${idx}">${cat.name}</option>`;
        });
    } else {
        alert("كلمة مرور المشرف غير صحيحة!");
    }
}

function addNewItem() {
    const catIndex = document.getElementById('add-item-category-select').value;
    const newItemName = document.getElementById('new-item-name-input').value.trim();

    if (!newItemName) return alert("يرجى كتابة اسم الصنف!");

    categories[catIndex].items.push(newItemName);
    localStorage.setItem('salma_categories_config', JSON.stringify(categories));
    document.getElementById('new-item-name-input').value = "";
    renderTable();
    alert(`تم إضافة (${newItemName}) بنجاح!`);
}

function addNewCategory() {
    const newCatName = document.getElementById('new-category-name-input').value.trim();
    if (!newCatName) return alert("يرجى كتابة اسم القائمة الجديد!");

    categories.push({ name: newCatName, items: ["صنف جديد 1"] });
    localStorage.setItem('salma_categories_config', JSON.stringify(categories));
    document.getElementById('new-category-name-input').value = "";
    renderTabs();
    alert(`تم إضافة قائمة (${newCatName}) بنجاح!`);
}

function saveAdminSettings() {
    const newName = document.getElementById('branch-name-edit').value.trim();
    const newPhone = document.getElementById('branch-phone-edit').value.trim();
    const newRec = document.getElementById('pass-received-edit').value;
    const newDel = document.getElementById('pass-delivered-edit').value;
    const newAdm = document.getElementById('pass-admin-edit').value;

    if (!newName || !newPhone || !newRec || !newDel || !newAdm) {
        return alert("لا يمكن ترك أي من الحقول فارغة!");
    }

    localStorage.setItem('salma_branch_name', newName);
    localStorage.setItem('salma_branch_phone', newPhone);
    localStorage.setItem('salma_pass_rec', newRec);
    localStorage.setItem('salma_pass_del', newDel);
    localStorage.setItem('salma_pass_adm', newAdm);

    updateBranchTag();
    alert("تم حفظ الإعدادات بنجاح!");
    closeAdminModal();
}
