# CredsVault

A secure, modern, and responsive web application designed for developers and teams to manage sensitive credentials across multiple projects, environments, and roles. Built with React and Firebase, this app provides a centralized and accessible solution to the common problem of juggling numerous usernames, passwords, and URLs.

## ✨ Features

* **Secure Authentication:** Users can sign up and log in using Firebase's email and password authentication. All data is securely tied to the user's unique ID.
* **Hierarchical Organization:** Structure your credentials logically:
    * **Projects:** Top-level containers for your work (e.g., "Client Website," "Internal API").
    * **Environments:** Define different stages within a project (e.g., `dev`, `uat`, `stg`, `prod`). Each environment can have its own base URL.
    * **Roles:** Group credentials by user type or function within an environment (e.g., "Admin," "Broker," "Read-only User").
* **Credential Management:** Easily add, edit, and delete accounts (username/password pairs) within each role.
* **Global Search:** A powerful, real-time search bar allows you to instantly find any project, environment, role, or username across your entire vault.
* **Modern & Responsive UI:** A sleek, dark-themed interface built with Tailwind CSS that is fully responsive and accessible on desktop, tablet, and mobile devices.
* **User-Friendly UX:** Features like one-click copy for credentials and password visibility toggles make the app intuitive and efficient to use.

## 🚀 Tech Stack

* **Frontend:** [React](https://reactjs.org/) (with Hooks)
* **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore Database, Authentication, Hosting)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)

## 🛠️ Setup & Deployment

Follow these steps to get the project running locally and deploy it to the web.

### 1. Prerequisites

* Node.js and npm installed.
* A Firebase project created on the [Firebase Console](https://console.firebase.google.com/).
    * Enable **Firestore Database**.
    * Enable **Email/Password** sign-in method in the Authentication section.

### 2. Local Development

**a. Clone the repository:**

```bash
git clone https://github.com/mayankkalra03/creds-vault.git
cd creds-vault
```

**b. Install dependencies:**

```bash
npm install
```

**c. Create Environment Variables:**
Create a file named `.env` in the root of your project and add your Firebase project configuration. You can find these keys in your Firebase project settings.

```bash
REACT_APP_FIREBASE_API_KEY="your-api-key"
REACT_APP_FIREBASE_AUTH_DOMAIN="your-auth-domain"
REACT_APP_FIREBASE_PROJECT_ID="your-project-id"
REACT_APP_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
REACT_APP_FIREBASE_APP_ID="your-app-id"
```

**d. Start the development server:**

```bash
npm start
```

The application should now be running on http://localhost:3000.

### 3. Deployment with Firebase Hosting

**a. Install Firebase Tools:**

```bash
npm install -g firebase-tools
```

**b. Login to Firebase:**

```bash
firebase login
```

**c. Initialize Firebase in your project:**

```bash
firebase init
```

- Select Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys.

- Choose your existing Firebase project.

- Set your public directory to build.

- Configure as a single-page app? Yes.

- Set up automatic builds and deploys with GitHub? No (for now).

**d. Build the application for production:**

```bash
npm run build
```

**e. Deploy to Firebase:**

```bash
firebase deploy
```

After deployment, the CLI will provide you with the live URL for your application.