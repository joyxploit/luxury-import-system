const sellerForm = document.getElementById('sellerForm');
const productsGrid = document.getElementById('sellerProducts');
const productImageInput = document.getElementById('productImage');
const productImagePreview = document.getElementById('productImagePreview');
const logoutBtn = document.getElementById('logoutBtn');

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

// 4. SUBMIT FORM
if (sellerForm) {
    sellerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;

        const name = document.getElementById('productName').value;
        const price = document.getElementById('productPrice').value;
        const category = document.getElementById('productCategory').value;
        const description = document.getElementById('productDescription').value;
        const file = productImageInput.files[0];

        // Convert Image to Base64
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

        const productData = { name, price, category, description, image: imageBase64 };

        try {
            const response = await fetch('https://luxury-backend-qtck.onrender.com/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (result.success) {
                alert("✅ Product Saved!");
                sellerForm.reset();
                productImagePreview.style.display = 'none';
                loadSellerProducts();
            } else {
                alert("❌ Error: " + result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Server Connection Failed");
        } finally {
            submitBtn.innerText = "Publish Item";
            submitBtn.disabled = false;
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

// 5. LOAD PRODUCTS
async function loadSellerProducts() {
    // Safety check: if the grid element doesn't exist, stop
    if (!productsGrid) return;
    
    // Show loading message
    productsGrid.innerHTML = '<p style="text-align:center">Loading inventory...</p>';

    try {
        // Fetch from Backend
        const response = await fetch ('https://luxury-backend-qtck.onrender.com/api/products');
        const data = await response.json();

        if (data.success && data.products) {
            productsGrid.innerHTML = ''; // Clear "Loading..." message
            
            // Check if empty
            if (data.products.length === 0) {
                productsGrid.innerHTML = '<p style="text-align:center">No products found.</p>';
                return;
            }

            // Loop through products
            data.products.forEach(p => {
                // Handle Image
                let img = p.image || 'https://via.placeholder.com/150';
                if(Array.isArray(p.images) && p.images.length > 0) {
                    img = p.images[0];
                }

                // Create Card HTML
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
                    <button onclick="deleteProduct(${p.id})" style="color:white; background:#ff4444; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
                `;
                
                productsGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        productsGrid.innerHTML = '<p style="color:red; text-align:center">Failed to load products. Is the server running?</p>';
    }
}

window.deleteProduct = async function(id) {
    if(confirm("Delete?")) {
        await fetch(`https://luxury-backend-qtck.onrender.com/api/products/${id}`, { method: 'DELETE' });
        loadSellerProducts();
    }
}
