# 🍽️ Smart Recipe Hub

Smart Recipe Hub is a modern web application designed to simplify meal planning and cooking. It offers intelligent recipe suggestions based on user preferences, dietary needs, and available ingredients.

---

## 🚀 Features

* Intelligent recipe recommendations
* Ingredient-based search
* Modern tech stack with Node.js, Express, React, and MongoDB
* Secure Google Cloud integration
* Responsive UI for a seamless experience

---

## 📋 System Requirements

Make sure you have the following installed before getting started:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [npm](https://www.npmjs.com/) (v9+ recommended)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rohansb27/Smart-Recipe-Hub.git
cd Smart-Recipe-Hub
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

### 4. Environment Setup

Create `.env` files in **both** the `frontend` and `backend` directories.

#### 📁 Backend `.env` Example:

```env
PORT=8000
MONGO_URI=your_mongo_connection_string
GCLOUD_PROJECT_ID=your_project_id
GCLOUD_CLIENT_EMAIL=your_email
GCLOUD_PRIVATE_KEY=your_private_key
```

#### 📁 Frontend `.env` Example:

```env
VITE_API_URL=http://localhost:8000
```

Make sure to replace the placeholder values with your actual credentials.

---

### 5. Running the App

#### Start Backend Server:

```bash
cd backend
npm start
```

#### Start Frontend (Dev Mode):

```bash
cd frontend
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173) by default (depending on your setup).

---

## 📂 Project Structure

```
Smart-Recipe-Hub/
├── backend/         # Express server, API routes, MongoDB integration
├── frontend/        # React app (Vite), components, views
└── README.md        # Project documentation
```


---

## 📄 License

This project is licensed under the MIT License.

