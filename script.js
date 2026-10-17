// =========================================================================
// 🔗 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
// =========================================================================
const CLOUD_API_URL = "https://script.google.com/macros/s/AKfycby-HCCNrYC-ZB0IKRFfZP2w4CXz2SmLz3MNJbGUCRGsywhTNe096MLxLaOU6L4GA3PRuA/exec";

// Default Categories and Items Structure
const defaultCategories = [
    {
        name: "قائمة 1 (أساسي)",
        items: [
            "سكر", "بن فاتح سادة", "بن فاتح محوج", "بن غامق محوج", "بن بندق", "اسبرسو", 
            "تست", "كراسون", "تشيز كيك", "اكلير", "ملفاي", "براونز", "دوناتس", 
            "عجينة وافل", "عجينة كباكي", "ساندوتش ميكس جبن تركي", "كوب دوناتس", 
            "غطاء دوناتس", "فاكهة حشو فراولة", "فاكهة حشو عنب بري"
        ]
    },
    {
        name: "قائمة 2 (المشروبات)",
        items: ["شاي أحمر", "شاي أخضر", "نعناع", "نسكافيه", "كركديه", "سحلب", "قرفة", "زنجبيل"]
    },
    {
        name: "قائمة 3 (الحلويات والصوصات)",
        items: ["صوص شوكولاتة", "صوص كراميل", "صوص فراولة", "عسل نحل", "مربى", "كريمة خفق"]
    },
    {
        name: "قائمة 4 (الأكواب والمستلزمات)",
        items: ["أكواب ورقية 8 أوز", "أكواب ورقية 12 أوز", "أغطية أكواب", "شاليموه", "مناديل", "أكياس بلاستيك"]
    },
    {
        name: "قائمة 5 (المستلزمات العامة)",
        items: ["صابون سائل", "كلور", "مظهر أرضيات", "إسفنج غسيل", "أكياس قمامة"]
    },
    {
        name: "قائمة 6 (المخزون العام)",
        items: ["زيت", "زبدة", "دقيق", "خميرة", "بيكنج بودر", "فانيليا"]
    }
];

// Load Categories from LocalStorage or Default
function loadCategories() {
    const saved = localStorage.getItem('salma_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
}

function saveCategories(cats) {
    localStorage.setItem('salma_categories', JSON.stringify(cats));
}

let categories = loadCategories();
let currentCategoryIndex = 0;

// Security Unlocks State
let isReceivedUnlocked = false;
let isDeliveredUnlocked = false;
let pendingUnlockTarget = null;

// Passwords Helper
function getPasswords() {
    return {
        received: localStorage.getItem('salma_pass_received') || "1234",
        delivered: localStorage.getItem('salma_pass_delivered') || "1234",
        admin: localStorage.getItem('salma_pass_admin') || "9999"
    };
}

// Branch Info Helper
function getBranchInfo() {
    return {
        name: localStorage.getItem('salma_branch_name') || "Resta",
        phone: localStorage.getItem('salma_branch_phone') || "01000000000"
    };
}

// UI Initialization
window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('app-container').classList.remove('hidden');

    const branch = getBranchInfo();
    document.getElementById('branch-display-tag').innerText = `فرع: ${branch.name}`;

    renderTabs();
    renderTable();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

function renderTabs() {
    const wrapper = document.getElementById('tabs-wrapper');
    wrapper.innerHTML = "";

    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === currentCategoryIndex ? 'active' : ''}`;
        btn.innerText = cat.name;
        btn.onclick = () => switchCategory(index);
        wrapper.appendChild(btn);
    });
}

function switchCategory(newIndex) {
    saveCurrentCategoryState();
    currentCategoryIndex = newIndex;
    renderTabs();
    renderTable();
}

function renderTable() {
    const activeCat = categories[currentCategoryIndex];
    document.getElementById('category-title').innerText = activeCat.name;

    document.getElementById('lock-icon-rec').innerText = isReceivedUnlocked ? "🔓" : "🔒";
    document.getElementById('lock-icon-del').innerText = isDeliveredUnlocked ? "🔓" : "🔒";

    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = "";

    const savedState = localStorage.getItem(`salma_cat_${currentCategoryIndex}`);
    const rowData = savedState ? JSON.parse(savedState) : null;
    const todayStr = new Date().toISOString().split('T')[0];

    activeCat.items.forEach((item, rIdx) => {
        const savedRow = rowData ? rowData[rIdx] : null;

        const dateVal = savedRow ? savedRow.rowDate : todayStr;
        const recVal = savedRow ? savedRow.received : 0;
        const newVal = savedRow ? savedRow.newStock : 0;
        const delVal = savedRow ? savedRow.delivered : 0;
        const totalVal = savedRow ? savedRow.total : 0;
        const noteVal = savedRow ? savedRow.note : "";

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item}</strong></td>
            <td><input type="date" class="row-date" value="${dateVal}"></td>
            <td><input type="number" class="row-rec ${isReceivedUnlocked ? '' : 'locked-input'}" value="${recVal}" ${isReceivedUnlocked ? '' : 'readonly'}></td>
            <td><input type="number" class="row-new" value="${newVal}" oninput="calculateRowTotal(this)"></td>
            <td><input type="number" class="row-del ${isDeliveredUnlocked ? '' : 'locked-input'}" value="${delVal}" ${isDeliveredUnlocked ? '' : 'readonly'} oninput="calculateRowTotal(this)"></td>
            <td><input type="number" class="row-total total-field" value="${totalVal}" readonly></td>
            <td><input type="text" class="row-note" value="${noteVal}" placeholder="..."></td>
        `;
        tbody.appendChild(tr);
    });
}

function calculateRowTotal(inputElem) {
    const row = inputElem.closest('tr');
    const rec = parseFloat(row.querySelector('.row-rec').value) || 0;
    const newVal = parseFloat(row.querySelector('.row-new').value) || 0;
    const del = parseFloat(row.querySelector('.row-del').value) || 0;

    const total = (rec + newVal) - del;
    row.querySelector('.row-total').value = total;
}

function saveCurrentCategoryState() {
    const tbody = document.getElementById('inventory-body');
    const rows = tbody.querySelectorAll('tr');
    if (!rows || rows.length === 0) return;

    const catData = [];

    rows.forEach((tr, rIdx) => {
        catData.push({
            item: categories[currentCategoryIndex].items[rIdx],
            rowDate: tr.querySelector('.row-date').value,
            received: tr.querySelector('.row-rec').value,
            newStock: tr.querySelector('.row-new').value,
            delivered: tr.querySelector('.row-del').value,
            total: tr.querySelector('.row-total').value,
            note: tr.querySelector('.row-note').value
        });
    });

    localStorage.setItem(`salma_cat_${currentCategoryIndex}`, JSON.stringify(catData));
}

// Toggle Lock / Unlock for Received and Delivered columns (Preserving typed values)
function requestColumnUnlock(type) {
    saveCurrentCategoryState();

    if (type === 'received') {
        if (isReceivedUnlocked) {
            isReceivedUnlocked = false;
            renderTable();
            return;
        }
    } else if (type === 'delivered') {
        if (isDeliveredUnlocked) {
            isDeliveredUnlocked = false;
            renderTable();
            return;
        }
    }

    pendingUnlockTarget = type;
    document.getElementById('modal-title').innerText = type === 'received' ? "فتح عمود (مستلم)" : "فتح عمود (مسلم)";
    document.getElementById('modal-password-input').value = "";
    document.getElementById('password-modal').style.display = "flex";
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = "none";
    pendingUnlockTarget = null;
}

function verifyPasswordAction() {
    const entered = document.getElementById('modal-password-input').value;
    const passes = getPasswords();

    if (pendingUnlockTarget === 'received' && entered === passes.received) {
        isReceivedUnlocked = true;
        closePasswordModal();
        renderTable();
    } else if (pendingUnlockTarget === 'delivered' && entered === passes.delivered) {
        isDeliveredUnlocked = true;
        closePasswordModal();
        renderTable();
    } else {
        alert("كلمة المرور غير صحيحة!");
    }
}

// Save & Sync Handler
async function handleSaveAndExport() {
    saveCurrentCategoryState();
    const branch = getBranchInfo();

    if (!confirm(`هل أنت متأكد من حفظ وتصدير تقرير الجرد لـ (${branch.name}) وإرساله للفرع الرئيسي؟`)) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Compile all category data
    let fullReport = [];
    categories.forEach((cat, catIdx) => {
        const saved = localStorage.getItem(`salma_cat_${catIdx}`);
        const itemsData = saved ? JSON.parse(saved) : cat.items.map(item => ({
            item: item, rowDate: todayStr, received: 0, newStock: 0, delivered: 0, total: 0, note: ""
        }));

        fullReport.push({
            categoryName: cat.name,
            items: itemsData
        });
    });

    // Generate Document HTML Structure
    let reportHtml = `
        <div style="font-family: system-ui, sans-serif; direction: rtl; padding: 25px; background: #ffffff; color: #0f172a;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="color: #1e293b; margin-bottom: 5px; font-size: 24px;">🏢 تقرير جرد فرع: ${branch.name}</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">📅 <strong>التاريخ:</strong> ${todayStr} | 📞 <strong>الهاتف:</strong> ${branch.phone}</p>
            </div>
    `;

    fullReport.forEach(cat => {
        reportHtml += `<h3 style="color: #2563eb; margin-top: 25px; margin-bottom: 10px; border-right: 4px solid #2563eb; padding-right: 10px; font-size: 18px;">📋 ${cat.categoryName}</h3>`;
        reportHtml += `
            <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center; border-color: #cbd5e1; margin-bottom: 15px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f1f5f9; color: #334155;">
                        <th>الصنف</th>
                        <th>التاريخ</th>
                        <th>مستلم</th>
                        <th>جديد</th>
                        <th>مسلم</th>
                        <th>العدد النهائي</th>
                        <th>ملاحظات</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cat.items.forEach(row => {
            reportHtml += `
                <tr>
                    <td><strong>${row.item}</strong></td>
                    <td>${row.rowDate || todayStr}</td>
                    <td>${row.received || 0}</td>
                    <td>${row.newStock || 0}</td>
                    <td>${row.delivered || 0}</td>
                    <td style="font-weight: bold; color: #2563eb; background: #eff6ff;">${row.total || 0}</td>
                    <td>${row.note || '-'}</td>
                </tr>
            `;
        });

        reportHtml += `</tbody></table>`;
    });

    reportHtml += `</div>`;

    // Encode to Base64 Data URI
    const base64Data = btoa(unescape(encodeURIComponent(reportHtml)));
    const dataUri = `data:text/html;charset=utf-8;base64,${base64Data}`;
    const fileName = `Report_${branch.name}_${todayStr}.html`;

    const newReport = {
        action: "add",
        id: Date.now(),
        branchName: branch.name,
        phone: branch.phone,
        date: todayStr,
        fileName: fileName,
        pdfDataUri: dataUri
    };

    try {
        await fetch(CLOUD_API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(newReport)
        });

        // Clear local storage state after successful dispatch
        categories.forEach((_, catIdx) => localStorage.removeItem(`salma_cat_${catIdx}`));
        isReceivedUnlocked = false;
        isDeliveredUnlocked = false;
        renderTable();

        alert("تم رفع التقرير بنجاح إلى السحابة وإرساله للفرع الرئيسي!");
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء إرسال التقرير. تأكد من الاتصال بالإنترنت.");
    }
}

// Admin Panel Logic
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
    const entered = document.getElementById('admin-master-input').value;
    const passes = getPasswords();

    if (entered === passes.admin) {
        document.getElementById('admin-login-view').style.display = "none";
        document.getElementById('admin-settings-view').style.display = "block";
        populateAdminPanelFields();
    } else {
        alert("كلمة مرور المشرف غير صحيحة!");
    }
}

function populateAdminPanelFields() {
    const branch = getBranchInfo();
    const passes = getPasswords();

    document.getElementById('branch-name-edit').value = branch.name;
    document.getElementById('branch-phone-edit').value = branch.phone;

    document.getElementById('pass-received-edit').value = passes.received;
    document.getElementById('pass-delivered-edit').value = passes.delivered;
    document.getElementById('pass-admin-edit').value = passes.admin;

    populateCategorySelects();
}

function populateCategorySelects() {
    const addCatSelect = document.getElementById('add-item-category-select');
    const delCatSelectItem = document.getElementById('del-item-category-select');
    const delCatSelect = document.getElementById('del-category-select');

    addCatSelect.innerHTML = "";
    delCatSelectItem.innerHTML = "";
    delCatSelect.innerHTML = "";

    categories.forEach((cat, idx) => {
        const opt1 = new Option(cat.name, idx);
        const opt2 = new Option(cat.name, idx);
        const opt3 = new Option(cat.name, idx);

        addCatSelect.add(opt1);
        delCatSelectItem.add(opt2);
        delCatSelect.add(opt3);
    });

    populateItemsForDeletion();
}

function populateItemsForDeletion() {
    const catIdx = document.getElementById('del-item-category-select').value;
    const delItemSelect = document.getElementById('del-item-name-select');
    delItemSelect.innerHTML = "";

    if (categories[catIdx] && categories[catIdx].items) {
        categories[catIdx].items.forEach((item, idx) => {
            delItemSelect.add(new Option(item, idx));
        });
    }
}

function addNewItem() {
    const catIdx = document.getElementById('add-item-category-select').value;
    const itemName = document.getElementById('new-item-name-input').value.trim();

    if (!itemName) return alert("يرجى إدخال اسم الصنف!");

    categories[catIdx].items.push(itemName);
    saveCategories(categories);
    document.getElementById('new-item-name-input').value = "";
    populateCategorySelects();
    renderTable();
    alert("تمت إضافة الصنف بنجاح!");
}

function deleteSelectedItem() {
    const catIdx = document.getElementById('del-item-category-select').value;
    const itemIdx = document.getElementById('del-item-name-select').value;

    if (itemIdx === null || itemIdx === "") return alert("لا يوجد صنف محدد للحذف!");

    categories[catIdx].items.splice(itemIdx, 1);
    saveCategories(categories);
    populateCategorySelects();
    renderTable();
    alert("تم حذف الصنف بنجاح!");
}

function addNewCategory() {
    const catName = document.getElementById('new-category-name-input').value.trim();
    if (!catName) return alert("يرجى إدخال اسم القائمة الجديدة!");

    categories.push({ name: catName, items: [] });
    saveCategories(categories);
    document.getElementById('new-category-name-input').value = "";
    populateCategorySelects();
    renderTabs();
    alert("تمت إضافة القائمة الجديدة بنجاح!");
}

function deleteSelectedCategory() {
    const catIdx = document.getElementById('del-category-select').value;
    if (categories.length <= 1) return alert("لا يمكن حذف جميع القوائم! يجب إبقاء قائمة واحدة على الأقل.");

    if (confirm(`هل أنت متأكد من حذف قائمة (${categories[catIdx].name}) بالكامل؟`)) {
        categories.splice(catIdx, 1);
        saveCategories(categories);
        currentCategoryIndex = 0;
        populateCategorySelects();
        renderTabs();
        renderTable();
        alert("تم حذف القائمة بنجاح!");
    }
}

function saveAdminSettings() {
    const name = document.getElementById('branch-name-edit').value.trim();
    const phone = document.getElementById('branch-phone-edit').value.trim();

    const passRec = document.getElementById('pass-received-edit').value.trim();
    const passDel = document.getElementById('pass-delivered-edit').value.trim();
    const passAdm = document.getElementById('pass-admin-edit').value.trim();

    if (!name || !passRec || !passDel || !passAdm) {
        return alert("جميع الحقول مطلوبة!");
    }

    localStorage.setItem('salma_branch_name', name);
    localStorage.setItem('salma_branch_phone', phone);

    localStorage.setItem('salma_pass_received', passRec);
    localStorage.setItem('salma_pass_delivered', passDel);
    localStorage.setItem('salma_pass_admin', passAdm);

    document.getElementById('branch-display-tag').innerText = `فرع: ${name}`;
    alert("تم حفظ إعدادات المشرف بنجاح!");
    closeAdminModal();
}
