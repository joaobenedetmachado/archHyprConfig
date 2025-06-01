from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="Vagou API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ParkingLot(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    total_spots: int
    available_spots: int
    owner_id: str

class Reservation(BaseModel):
    parking_lot_id: str
    user_id: str
    datetime: datetime
    status: str = "pending"

# Routes
@app.post("/parking/register")
async def register_parking(parking: ParkingLot):
    try:
        parking_dict = parking.dict()
        parking_ref = db.collection('parking_lots').document()
        parking_dict['id'] = parking_ref.id
        parking_ref.set(parking_dict)
        return {"message": "Parking lot registered successfully", "id": parking_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/parking/nearby")
async def get_nearby_parking(latitude: float, longitude: float, radius: float = 5.0):
    try:
        # This is a simplified version. In production, you'd want to use geospatial queries
        parking_lots = db.collection('parking_lots').stream()
        return [lot.to_dict() for lot in parking_lots]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reservation")
async def create_reservation(reservation: Reservation):
    try:
        # Check if user already has an active reservation
        user_reservations = db.collection('reservations').where('user_id', '==', reservation.user_id).stream()
        active_reservations = [r for r in user_reservations if r.to_dict()['status'] == 'active']
        
        if active_reservations:
            raise HTTPException(status_code=400, detail="User already has an active reservation")
        
        # Create reservation
        reservation_dict = reservation.dict()
        reservation_ref = db.collection('reservations').document()
        reservation_dict['id'] = reservation_ref.id
        reservation_ref.set(reservation_dict)
        
        return {"message": "Reservation created successfully", "id": reservation_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/reservations")
async def get_user_reservations(user_id: str):
    try:
        reservations = db.collection('reservations').where('user_id', '==', user_id).stream()
        return [res.to_dict() for res in reservations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 