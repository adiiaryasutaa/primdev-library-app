# Library API

REST API untuk sistem manajemen perpustakaan. Dibangun dengan **Express.js**, **Prisma ORM**, **PostgreSQL**, dan **Cloudinary** untuk penyimpanan gambar.

---

## Tech Stack

| Teknologi | Versi |
|-----------|-------|
| Node.js | >= 18 |
| Express.js | ^5.2.1 |
| Prisma | ^6.19.2 |
| PostgreSQL | - |
| Cloudinary | ^2.9.0 |
| JWT | ^9.0.3 |
| bcryptjs | ^3.0.3 |

---

## Menjalankan Aplikasi

```bash
# Install dependencies
npm install

# Jalankan migrasi database
npx prisma migrate dev

# Seed data awal (opsional)
npx prisma db seed

# Jalankan development server
npm run dev
```

Server berjalan di `http://localhost:3000` (default).

---

## Autentikasi

API ini menggunakan **JWT Bearer Token**.

Sertakan token di header setiap request yang membutuhkan autentikasi:

```
Authorization: Bearer <token>
```

### Role

| Role | Deskripsi |
|------|-----------|
| `ADMIN` | Akses penuh ke semua endpoint |
| `USER` | Akses terbatas (hanya endpoint publik & endpoint Books tertentu) |

---

## Base URL

```
http://localhost:3000
```

---

## Data Models

### Users
| Field | Type | Keterangan |
|-------|------|------------|
| `id` | Int | Primary key |
| `name` | String | Nama pengguna |
| `email` | String | Email unik |
| `role` | Enum | `ADMIN` atau `USER` (default: `USER`) |
| `createdAt` | DateTime | Waktu dibuat |

### Categories
| Field | Type | Keterangan |
|-------|------|------------|
| `id` | Int | Primary key |
| `name` | String | Nama kategori |
| `createdAt` | DateTime | Waktu dibuat |

### Books
| Field | Type | Keterangan |
|-------|------|------------|
| `id` | Int | Primary key |
| `title` | String | Judul buku |
| `author` | String | Penulis |
| `year` | Int | Tahun terbit |
| `available` | Boolean | Status ketersediaan (default: `true`) |
| `categoryId` | Int? | FK ke Categories (opsional) |
| `cloudinaryId` | String? | ID Cloudinary untuk cover buku |
| `coverUrl` | String? | URL cover buku (generated) |
| `createdAt` | DateTime | Waktu dibuat |

### Borrowings
| Field | Type | Keterangan |
|-------|------|------------|
| `id` | Int | Primary key |
| `userId` | Int | FK ke Users |
| `bookId` | Int | FK ke Books |
| `borrow_date` | DateTime | Tanggal peminjaman (default: now) |
| `returned_at` | DateTime? | Tanggal pengembalian |
| `createdAt` | DateTime | Waktu dibuat |

---

## Endpoint

### Ringkasan

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | - | - | Health check |
| POST | `/api/register` | - | - | Registrasi pengguna baru |
| POST | `/api/login` | - | - | Login & dapatkan token |
| GET | `/api/books` | - | - | Ambil semua buku |
| GET | `/api/books/:id` | ✓ | USER / ADMIN | Ambil buku berdasarkan ID |
| POST | `/api/books` | ✓ | ADMIN | Tambah buku baru |
| PUT | `/api/books/:id` | ✓ | ADMIN | Update buku |
| DELETE | `/api/books/:id` | ✓ | ADMIN | Hapus buku |
| GET | `/api/users` | ✓ | ADMIN | Ambil semua pengguna |
| GET | `/api/users/:id` | ✓ | ADMIN | Ambil pengguna berdasarkan ID |
| GET | `/api/users/:id/borrows` | ✓ | ADMIN | Ambil riwayat peminjaman pengguna |
| POST | `/api/users` | ✓ | ADMIN | Tambah pengguna baru |
| PUT | `/api/users/:id` | ✓ | ADMIN | Update pengguna |
| DELETE | `/api/users/:id` | ✓ | ADMIN | Hapus pengguna |
| GET | `/api/borrowings` | ✓ | ADMIN | Ambil semua data peminjaman |
| GET | `/api/borrowings/:id` | ✓ | ADMIN | Ambil peminjaman berdasarkan ID |
| POST | `/api/borrowings` | ✓ | ADMIN | Tambah data peminjaman |
| PATCH | `/api/borrowings/:id/return` | ✓ | ADMIN | Proses pengembalian buku |
| DELETE | `/api/borrowings/:id` | ✓ | ADMIN | Hapus data peminjaman |
| GET | `/api/categories` | ✓ | ADMIN | Ambil semua kategori |
| GET | `/api/categories/:id` | ✓ | ADMIN | Ambil kategori berdasarkan ID |
| GET | `/api/categories/:id/books` | ✓ | ADMIN | Ambil buku berdasarkan kategori |
| POST | `/api/categories` | ✓ | ADMIN | Tambah kategori baru |
| PUT | `/api/categories/:id` | ✓ | ADMIN | Update kategori |
| DELETE | `/api/categories/:id` | ✓ | ADMIN | Hapus kategori |

---

## Auth

### POST `/api/register`

Registrasi pengguna baru dengan role `USER`.

**Request Body** (`application/json`)

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "rahasia123"
}
```

| Field | Type | Validasi |
|-------|------|----------|
| `name` | String | Wajib |
| `email` | String | Wajib, format email valid |
| `password` | String | Wajib, minimal 6 karakter |

**Response `201 Created`**

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
}
```

**Response `409 Conflict`** — Email sudah digunakan

```json
{
  "error": "Email already in use"
}
```

---

### POST `/api/login`

Login dan dapatkan JWT access token.

**Request Body** (`application/json`)

```json
{
  "email": "john@example.com",
  "password": "rahasia123"
}
```

| Field | Type | Validasi |
|-------|------|----------|
| `email` | String | Wajib, format email valid |
| `password` | String | Wajib |

**Response `200 OK`**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T07:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `401 Unauthorized`** — Email atau password salah

```json
{
  "message": "Invalid credentials"
}
```

> Token berlaku selama **1 jam**.

---

## Books

### GET `/api/books`

Ambil semua buku. **Tidak memerlukan autentikasi.**

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "year": 2008,
    "available": true,
    "categoryId": 2,
    "cloudinaryId": "library/cover_abc123",
    "createdAt": "2026-03-06T07:00:00.000Z",
    "coverUrl": "https://res.cloudinary.com/..."
  }
]
```

---

### GET `/api/books/:id`

Ambil detail buku berdasarkan ID. **Memerlukan autentikasi.**

**Parameters**

| Param | Type | Keterangan |
|-------|------|------------|
| `id` | Int | ID buku |

**Response `200 OK`**

```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "year": 2008,
  "available": true,
  "categoryId": 2,
  "cloudinaryId": "library/cover_abc123",
  "createdAt": "2026-03-06T07:00:00.000Z",
  "coverUrl": "https://res.cloudinary.com/..."
}
```

**Response `404 Not Found`**

```json
{
  "message": "Book not found"
}
```

---

### POST `/api/books`

Tambah buku baru. **Hanya ADMIN.**

**Request Body** (`multipart/form-data`)

| Field | Type | Validasi |
|-------|------|----------|
| `title` | String | Wajib |
| `author` | String | Wajib |
| `year` | Int | Wajib, angka |
| `categoryId` | Int | Opsional |
| `cover` | File | Opsional, PNG/JPEG, maks 1MB |

**Response `201 Created`**

```json
{
  "message": "Book added",
  "book": {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "year": 2008,
    "available": true,
    "categoryId": 2,
    "cloudinaryId": "library/cover_abc123",
    "createdAt": "2026-03-06T07:00:00.000Z",
    "coverUrl": "https://res.cloudinary.com/..."
  }
}
```

---

### PUT `/api/books/:id`

Update data buku. **Hanya ADMIN.** Semua field bersifat opsional.

**Parameters**

| Param | Type | Keterangan |
|-------|------|------------|
| `id` | Int | ID buku |

**Request Body** (`multipart/form-data`)

| Field | Type | Keterangan |
|-------|------|------------|
| `title` | String | Opsional |
| `author` | String | Opsional |
| `year` | Int | Opsional |
| `categoryId` | Int | Opsional |
| `cover` | File | Opsional, PNG/JPEG, maks 1MB |

**Response `200 OK`**

```json
{
  "message": "Book updated successfully",
  "book": {
    "id": 1,
    "title": "Clean Code (Updated)",
    "author": "Robert C. Martin",
    "year": 2008,
    "available": true,
    "categoryId": 2,
    "cloudinaryId": "library/cover_xyz456",
    "createdAt": "2026-03-06T07:00:00.000Z",
    "coverUrl": "https://res.cloudinary.com/..."
  }
}
```

---

### DELETE `/api/books/:id`

Hapus buku beserta cover dari Cloudinary. **Hanya ADMIN.**

**Parameters**

| Param | Type | Keterangan |
|-------|------|------------|
| `id` | Int | ID buku |

**Response `200 OK`**

```json
{
  "message": "Book with ID: 1 deleted"
}
```

---

## Users

> Semua endpoint Users memerlukan autentikasi dan role **ADMIN**.

### GET `/api/users`

Ambil semua pengguna.

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
]
```

---

### GET `/api/users/:id`

Ambil detail pengguna berdasarkan ID.

**Response `200 OK`**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2026-03-06T07:00:00.000Z"
}
```

**Response `404 Not Found`**

```json
{
  "message": "User not found"
}
```

---

### GET `/api/users/:id/borrows`

Ambil riwayat peminjaman buku milik pengguna tertentu.

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "userId": 1,
    "bookId": 2,
    "borrow_date": "2026-03-01T00:00:00.000Z",
    "returned_at": null,
    "createdAt": "2026-03-01T00:00:00.000Z",
    "book": {
      "id": 2,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "year": 2008,
      "available": false
    }
  }
]
```

---

### POST `/api/users`

Tambah pengguna baru.

**Request Body** (`application/json`)

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "rahasia123",
  "role": "USER"
}
```

| Field | Type | Validasi |
|-------|------|----------|
| `name` | String | Wajib |
| `email` | String | Wajib, format email valid |
| `password` | String | Wajib, minimal 6 karakter |
| `role` | Enum | Wajib, `ADMIN` atau `USER` |

**Response `201 Created`**

```json
{
  "message": "User created",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
}
```

---

### PUT `/api/users/:id`

Update data pengguna. Semua field bersifat opsional.

**Request Body** (`application/json`)

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "passwordbaru",
  "role": "ADMIN"
}
```

| Field | Type | Keterangan |
|-------|------|------------|
| `name` | String | Opsional |
| `email` | String | Opsional, format email valid |
| `password` | String | Opsional, minimal 6 karakter |
| `role` | Enum | Opsional, `ADMIN` atau `USER` |

**Response `200 OK`**

```json
{
  "message": "User updated",
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "ADMIN",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
}
```

---

### DELETE `/api/users/:id`

Hapus pengguna.

**Response `200 OK`**

```json
{
  "message": "User with ID: 2 deleted"
}
```

---

## Borrowings

> Semua endpoint Borrowings memerlukan autentikasi dan role **ADMIN**.

### GET `/api/borrowings`

Ambil semua data peminjaman.

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "userId": 1,
    "bookId": 2,
    "borrow_date": "2026-03-01T00:00:00.000Z",
    "returned_at": null,
    "createdAt": "2026-03-01T00:00:00.000Z",
    "borrower": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "book": {
      "id": 2,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "year": 2008,
      "available": false
    }
  }
]
```

---

### GET `/api/borrowings/:id`

Ambil detail peminjaman berdasarkan ID.

**Response `200 OK`** — Sama seperti objek di atas

**Response `404 Not Found`**

```json
{
  "message": "Borrowing not found"
}
```

---

### POST `/api/borrowings`

Buat peminjaman baru. Buku harus dalam status `available: true`.

**Request Body** (`application/json`)

```json
{
  "userId": 1,
  "bookId": 2
}
```

| Field | Type | Validasi |
|-------|------|----------|
| `userId` | Int | Wajib |
| `bookId` | Int | Wajib |

**Response `201 Created`**

```json
{
  "message": "Borrowing created",
  "borrowing": {
    "id": 1,
    "userId": 1,
    "bookId": 2,
    "borrow_date": "2026-03-06T07:00:00.000Z",
    "returned_at": null,
    "createdAt": "2026-03-06T07:00:00.000Z",
    "borrower": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "book": {
      "id": 2,
      "title": "Clean Code",
      "available": false
    }
  }
}
```

**Response `400 Bad Request`** — Buku tidak tersedia

```json
{
  "message": "Book is not available for borrowing"
}
```

> Saat peminjaman dibuat, status `available` buku otomatis berubah menjadi `false`.

---

### PATCH `/api/borrowings/:id/return`

Proses pengembalian buku.

**Parameters**

| Param | Type | Keterangan |
|-------|------|------------|
| `id` | Int | ID peminjaman |

**Response `200 OK`**

```json
{
  "message": "Book returned successfully",
  "borrowing": {
    "id": 1,
    "userId": 1,
    "bookId": 2,
    "borrow_date": "2026-03-01T00:00:00.000Z",
    "returned_at": "2026-03-06T07:00:00.000Z",
    "borrower": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "book": {
      "id": 2,
      "title": "Clean Code",
      "available": true
    }
  }
}
```

**Response `400 Bad Request`** — Buku sudah dikembalikan

```json
{
  "message": "Book already returned"
}
```

> Saat pengembalian diproses, status `available` buku otomatis berubah menjadi `true`.

---

### DELETE `/api/borrowings/:id`

Hapus data peminjaman. Jika buku belum dikembalikan, status buku otomatis dikembalikan ke `available: true`.

**Response `200 OK`**

```json
{
  "message": "Borrowing with ID: 1 deleted"
}
```

---

## Categories

> Semua endpoint Categories memerlukan autentikasi dan role **ADMIN**.

### GET `/api/categories`

Ambil semua kategori.

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "name": "Fiction",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
]
```

---

### GET `/api/categories/:id`

Ambil detail kategori berdasarkan ID.

**Response `200 OK`**

```json
{
  "id": 1,
  "name": "Fiction",
  "createdAt": "2026-03-06T07:00:00.000Z"
}
```

**Response `404 Not Found`**

```json
{
  "message": "Category not found"
}
```

---

### GET `/api/categories/:id/books`

Ambil semua buku dalam kategori tertentu.

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "year": 1937,
    "available": true,
    "categoryId": 1,
    "coverUrl": "https://res.cloudinary.com/..."
  }
]
```

---

### POST `/api/categories`

Tambah kategori baru.

**Request Body** (`application/json`)

```json
{
  "name": "Science Fiction"
}
```

| Field | Type | Validasi |
|-------|------|----------|
| `name` | String | Wajib |

**Response `201 Created`**

```json
{
  "message": "Category created",
  "category": {
    "id": 2,
    "name": "Science Fiction",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
}
```

---

### PUT `/api/categories/:id`

Update nama kategori.

**Request Body** (`application/json`)

```json
{
  "name": "Sci-Fi"
}
```

| Field | Type | Keterangan |
|-------|------|------------|
| `name` | String | Opsional |

**Response `200 OK`**

```json
{
  "message": "Category updated",
  "category": {
    "id": 2,
    "name": "Sci-Fi",
    "createdAt": "2026-03-06T07:00:00.000Z"
  }
}
```

---

### DELETE `/api/categories/:id`

Hapus kategori.

**Response `200 OK`**

```json
{
  "message": "Category with ID: 2 deleted"
}
```

---

## Error Responses Umum

| Status | Keterangan |
|--------|------------|
| `400` | Validasi input gagal |
| `401` | Kredensial tidak valid |
| `403` | Token tidak ada / tidak valid / akses ditolak |
| `404` | Resource tidak ditemukan |
| `409` | Konflik data (misal: email sudah terdaftar) |
| `500` | Internal server error |

**Response `400 Bad Request`** (validasi gagal)

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

**Response `403 Forbidden`** (token tidak ada)

```json
{
  "error": "Access token is missing"
}
```

**Response `403 Forbidden`** (bukan admin)

```json
{
  "error": "Access denied. Admins only."
}
```
