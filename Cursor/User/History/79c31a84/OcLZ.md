# Vagou - Parking Spot Reservation App

A mobile application for finding and reserving parking spots, built with React Native and FastAPI.

## Features

- Google Authentication
- Real-time parking spot availability
- Interactive map with parking locations
- Parking spot reservation system
- Owner dashboard for managing parking lots
- User profile with reservation history

## Tech Stack

- Frontend: React Native (Expo)
- Backend: FastAPI (Python)
- Database: Firebase (Firestore)
- Authentication: Firebase Auth
- Maps: React Native Maps
- Location Services: Expo Location

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- Firebase account
- Google Cloud account (for Maps API)
- Expo CLI

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Firestore
3. Add a new Web App to your Firebase project
4. Download the Firebase configuration
5. Enable Google Sign-In in Authentication methods

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your Firebase configuration:
   ```
   FIREBASE_CREDENTIALS_PATH=path/to/your/serviceAccountKey.json
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Firebase configuration:
   - Open `src/config/firebase.js`
   - Replace the placeholder values with your Firebase configuration

4. Update Google Sign-In configuration:
   - Open `App.js`
   - Replace `YOUR_WEB_CLIENT_ID` with your Firebase Web Client ID

5. Start the Expo development server:
   ```bash
   npm start
   ```

## Running the App

1. Install the Expo Go app on your mobile device
2. Scan the QR code from the Expo development server
3. The app will load on your device

## Development

- Backend API runs on `http://localhost:8000`
- API documentation available at `http://localhost:8000/docs`
- Frontend development server runs on `http://localhost:19000`

## Project Structure

```
.
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   ├── navigation/
│   │   └── screens/
│   ├── App.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 