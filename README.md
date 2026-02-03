##
✅ 0. Check server
Health check
GET /health


Should return:

{ "ok": true }

✅ 1. Register user
POST /api/auth/register


Body:

{
  "name": "Devansh",
  "email": "dev@gmail.com",
  "password": "123456"
}

✅ 2. Login user
POST /api/auth/login


Body:

{
  "email": "dev@gmail.com",
  "password": "123456"
}


Response gives:

{
  "token": "xxxxx"
}

🔑 Save token

In Postman headers for future requests:

Authorization: Bearer TOKEN

✅ 3. Get categories
GET /api/categories

✅ 4. Admin creates category (admin token)
POST /api/categories


Body:

{
  "name": "T-Shirts"
}

✅ 5. Admin creates product
POST /api/products


Body example:

{
  "title": "Black Oversized T-Shirt",
  "slug": "black-oversized-tshirt",
  "price": 499,
  "stock": 50,
  "category": "CATEGORY_ID"
}

✅ 6. View products
GET /api/products


Copy product _id.

✅ 7. Add product to cart
POST /api/cart


Body:

{
  "product": "PRODUCT_ID",
  "qty": 2,
  "size": "M",
  "color": "Black"
}

✅ 8. View cart
GET /api/cart

✅ 9. Add address
POST /api/addresses


Body:

{
  "fullName": "Devansh Mishra",
  "phone": "9999999999",
  "line1": "Street 1",
  "city": "Lucknow",
  "state": "UP",
  "pincode": "226001"
}

✅ 10. Place COD order
POST /api/orders/cod/from-cart


Body:

{
  "shippingAddress": {
    "fullName": "Devansh Mishra",
    "phone": "9999999999",
    "line1": "Street 1",
    "city": "Lucknow",
    "state": "UP",
    "pincode": "226001"
  }
}


Cart becomes empty, order created.

✅ 11. View orders
GET /api/orders/me


Copy order ID.

✅ 12. Admin updates order status

Admin token required.

PUT /api/orders/{id}/status


Body:

{ "status": "confirmed" }


Then:

{ "status": "shipped" }


Then:

{ "status": "delivered" }

✅ 13. User cancels order (if allowed)
PUT /api/orders/{id}/cancel

✅ 14. Add review
POST /api/products/{id}/review


Body:

{
  "rating": 5,
  "comment": "Great quality"
}

✅ 15. Wishlist

Add:

POST /api/wishlist


Remove:

DELETE /api/wishlist/{productId}

✅ 16. Profile update
PUT /api/users/me

✅ 17. Admin dashboard
GET /api/admin/dashboard