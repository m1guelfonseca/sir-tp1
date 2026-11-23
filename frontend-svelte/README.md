# Svelte Frontend (Student Management)

A reactive, clean, and modular frontend built with **Svelte 5** and **Vite** for the SIR Practical Assignment (Students & Courses RESTful API).

---

## 🚀 How to Run

### 1. Start the API / Backend
Make sure your backend API (Express or json-server) is running on port `3000`:

```bash
# In the backend directory:
cd backend
npm start
```
*(or with the mock server: `cd mock-server && npm start`)*

---

### 2. Start the Svelte Frontend
In a new terminal window:

```bash
cd frontend-svelte
npm run dev
```

Open the displayed address in your web browser (usually [http://localhost:5173](http://localhost:5173)).

> **Proxy configured:** Vite automatically proxies requests starting with `/alunos` and `/cursos` directly to `http://localhost:3000`, preventing any CORS issues.

---

## 🛠️ Build for Production

To generate the optimized static assets:

```bash
npm run build
```

The output will be placed inside the `dist/` directory.

---

## 📁 Architecture & Code Details

* **`src/App.svelte`**: Single-file Svelte 5 component with self-documenting variables and clean separation of concerns:
  * **Reactive State:** Uses Svelte 5 runes (`$state`, `$derived`, `onMount`).
  * **Filtering:** Instant search by name/surname and course filter with `$derived`.
  * **CRUD Operations:**
    * Create: Modal form submission via `POST /alunos`.
    * Edit: Pre-populated modal form via `PUT /alunos/:id`.
    * Delete: Confirmation dialog and request via `DELETE /alunos/:id`.
  * **Feedback:** User-friendly loading states, empty messages, error alerts, and success toasts.
* **`src/app.css`**: Global design tokens and base styles.
* **`vite.config.js`**: Vite configuration with backend proxy.
