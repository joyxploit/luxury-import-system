const sellerForm = document.getElementById('sellerForm');
const productsGrid = document.getElementById('sellerProducts');
const productImageInput = document.getElementById('productImage');
const productImagePreview = document.getElementById('productImagePreview');
const logoutBtn = document.getElementById('logoutBtn');
const formTitle = document.getElementById('form-title');
const submitBtnEl = document.getElementById('submitBtn');

let editingProductId = null; // null = create mode, otherwise = editing this product's id

// 1. INITIALIZE
document.addEventListener('DOMContentLoaded', loadSellerProducts);


// 3. IMAGE PREVIEW
if(productImageInput) {
    productImageInput.addEventListener('change', () => {
        const file = productImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                productImagePreview.src = e.target.result;
                productImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// 4. SUBMIT FORM (handles both Create and Update)
if (sellerForm) {
    sellerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const isEditing = !!editingProductId;

        submitBtn.innerText = isEditing ? "Updating..." : "Processing...";
        submitBtn.disabled = true;

        const name = document.getElementById('productName').value;
        const price = document.getElementById('productPrice').value;
        const category = document.getElementById('productCategory').value;
        const description = document.getElementById('productDescription').value;
        const file = productImageInput.files[0];

        // Convert Image to Base64 (only if a new file was chosen)
        let imageBase64 = "";
        if (file) {
            try {
                imageBase64 = await toBase64(file);
            } catch(err) {
                alert("Error reading file");
                submitBtn.disabled = false;
                return;
            }
        }

        const productData = { name, price, category, description };
        // Only include image if a new one was picked — avoids wiping the existing image on edit
        if (imageBase64) productData.image = imageBase64;

        try {
            const url = isEditing
                ? `https://luxury-backend-qtck.onrender.com/api/products/${editingProductId}`
                : 'https://luxury-backend-qtck.onrender.com/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (result.success) {
                alert(isEditing ? "✅ Product Updated!" : "✅ Product Saved!");
                exitEditMode();
                productImagePreview.style.display = 'none';
                loadSellerProducts();
            } else {
                alert("❌ Error: " + result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Server Connection Failed");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = editingProductId ? "Update Item" : "Publish Item";
        }
    });
}

// Helper: Convert File to Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// ── EDIT MODE ──────────────────────────────────────────
window.editProduct = function(id) {
    const product = allSellerProducts.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;

    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productDescription').value = product.description || '';

    // Image stays as-is unless the seller picks a new file
    productImageInput.value = '';
    let img = product.image || (Array.isArray(product.images) && product.images[0]) || '';
    if (img) {
        productImagePreview.src = img;
        productImagePreview.style.display = 'block';
        document.getElementById('previewContainer').style.display = 'block';
    }

    // File input is no longer required while editing (existing image is kept if untouched)
    productImageInput.required = false;

    if (formTitle) formTitle.textContent = '✏️ Edit Product';
    if (submitBtnEl) submitBtnEl.innerText = 'Update Item';

    // Add a Cancel button if not already present
    if (!document.getElementById('cancelEditBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.textContent = 'Cancel Edit';
        cancelBtn.style.cssText = 'margin-left:8px;background:#9ca3af;color:white;border:none;padding:10px 16px;border-radius:4px;cursor:pointer;';
        cancelBtn.addEventListener('click', exitEditMode);
        submitBtnEl.parentNode.appendChild(cancelBtn);
    }

    // Scroll the form into view so the seller sees what they're editing
    sellerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function exitEditMode() {
    editingProductId = null;
    sellerForm.reset();
    productImagePreview.style.display = 'none';
    productImageInput.required = true;
    if (formTitle) formTitle.textContent = '➕ Add New Product';
    if (submitBtnEl) submitBtnEl.innerText = 'Publish Item';
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.remove();
}

// 5. LOAD PRODUCTS
let allSellerProducts = []; // keep full list in memory for filtering + editing

async function loadSellerProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '<p style="text-align:center">Loading inventory...</p>';

    try {
        const response = await fetch('https://luxury-backend-qtck.onrender.com/api/products');
        const data = await response.json();

        if (data.success && data.products) {
            allSellerProducts = data.products;
            applyCategoryFilter();
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        productsGrid.innerHTML = '<p style="color:red; text-align:center">Failed to load products. Is the server running?</p>';
    }
}

function applyCategoryFilter() {
    const filterEl = document.getElementById('categoryFilter');
    const selected = filterEl ? filterEl.value : '';

    const list = selected
        ? allSellerProducts.filter(p => p.category === selected)
        : allSellerProducts;

    renderProductCards(list);
}

function renderProductCards(products) {
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align:center">No products found.</p>';
        return;
    }

    products.forEach(p => {
        let img = p.image || 'https://via.placeholder.com/150';
        if (Array.isArray(p.images) && p.images.length > 0) {
            img = p.images[0];
        }

        const card = document.createElement('div');
        card.className = 'seller-product-card';
        card.style.cssText = "display:flex; gap:15px; padding:10px; border:1px solid #eee; background:#fff; margin-bottom:10px; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.05);";

        card.innerHTML = `
            <img src="${img}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
            <div style="flex:1;">
                <h4 style="margin:0 0 5px 0;">${p.name}</h4>
                <p style="margin:0; font-size:13px; color:#666;">${p.category}</p>
                <p style="margin:0; font-weight:bold; color:#D4AF37;">Ksh ${Number(p.price).toLocaleString()}</p>
            </div>
            <button onclick="editProduct(${p.id})" style="color:white; background:#3b82f6; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Edit</button>
            <button onclick="deleteProduct(${p.id})" style="color:white; background:#ff4444; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
        `;

        productsGrid.appendChild(card);
    });
}

// Wire up the dropdown + read ?category= from URL on first load
document.addEventListener('DOMContentLoaded', () => {
    const filterEl = document.getElementById('categoryFilter');
    if (filterEl) {
        const params = new URLSearchParams(window.location.search);
        const urlCategory = params.get('category');
        if (urlCategory && urlCategory !== 'all') filterEl.value = urlCategory;
        filterEl.addEventListener('change', applyCategoryFilter);
    }
});

window.deleteProduct = async function(id) {
    if (confirm("Delete?")) {
        await fetch(`https://luxury-backend-qtck.onrender.com/api/products/${id}`, { method: 'DELETE' });
        loadSellerProducts();
    }
}
