# AuctionVerse API Documentation

### Base URL :  http://localhost:3000/api


## Authentication
All protected endpoints require authentication via session cookies. After login/register, cookies are automatically handled by the browser.

---

## 1. Authentication Endpoints

### Register User
- **Method:** `POST`
- **URL:** `/auth/register`
- **Headers:** `Content-Type: application/x-www-form-urlencoded`
- **Body (form-data):**
  ```
  username: string (required)
  email: string (required)
  password: string (required)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "profilePicture": "url",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Login User
- **Method:** `POST`
- **URL:** `/auth/login`
- **Headers:** `Content-Type: application/x-www-form-urlencoded`
- **Body (form-data):**
  ```
  email: string (required)
  password: string (required)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "profilePicture": "url",
      "wonAuctions": []
    }
  }
  ```

### Google OAuth Login
- **Method:** `GET`
- **URL:** `/auth/google`
- **Response:** Redirects to Google OAuth

### Google OAuth Callback
- **Method:** `GET`
- **URL:** `/auth/google/callback`
- **Response:** Redirects to frontend with session

### Logout
- **Method:** `POST`
- **URL:** `/auth/logout`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. Auction Endpoints

### Create Auction
- **Method:** `POST`
- **URL:** `/auction/`
- **Headers:** `Content-Type: multipart/form-data`
- **Body (form-data):**
  ```
  title: string (required)
  description: string (optional)
  startingPrice: number (required)
  startTime: string (required, ISO format)
  itemImage: file (optional)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "auction": {
      "_id": "auction_id",
      "title": "Vintage Watch",
      "description": "Beautiful vintage timepiece",
      "itemImage": "https://cloudinary.com/image.jpg",
      "startingPrice": 100,
      "currentPrice": 100,
      "startTime": "2024-06-01T10:00:00.000Z",
      "createdBy": "user_id",
      "participants": ["user_id"],
      "status": "upcoming",
      "winner": null,
      "winningBid": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error Response (1-hour gap violation):**
  ```json
  {
    "success": false,
    "message": "There must be at least a 1-hour gap between any two auctions.",
    "statusCode": 400
  }
  ```

### Join Auction
- **Method:** `POST`
- **URL:** `/auction/:auctionId/join`
- **Headers:** None required
- **Body:** None required
- **Response:**
  ```json
  {
    "success": true,
    "auction": {
      "_id": "auction_id",
      "title": "Vintage Watch",
      "participants": ["user_id", "other_user_id"],
      "status": "active"
    }
  }
  ```

### End Auction (Admin/Creator Only)
- **Method:** `POST`
- **URL:** `/auction/:auctionId/end`
- **Headers:** None required
- **Body:** None required
- **Response:**
  ```json
  {
    "success": true,
    "auction": {
      "_id": "auction_id",
      "title": "Vintage Watch",
      "status": "ended",
      "winner": "winner_user_id",
      "winningBid": 250,
      "currentPrice": 250
    }
  }
  ```

### Get Auction Details
- **Method:** `GET`
- **URL:** `/auction/:auctionId`
- **Headers:** None required
- **Response:**
  ```json
  {
    "success": true,
    "auction": {
      "_id": "auction_id",
      "title": "Vintage Watch",
      "description": "Beautiful vintage timepiece",
      "itemImage": "https://cloudinary.com/image.jpg",
      "startingPrice": 100,
      "currentPrice": 250,
      "startTime": "2024-06-01T10:00:00.000Z",
      "createdBy": {
        "_id": "user_id",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "participants": [
        {
          "_id": "user_id",
          "username": "john_doe",
          "email": "john@example.com"
        }
      ],
      "status": "active",
      "winner": {
        "_id": "winner_id",
        "username": "winner_user",
        "email": "winner@example.com"
      },
      "winningBid": 250,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

---

## 3. Bid Endpoints

### Place Bid
- **Method:** `POST`
- **URL:** `/bid/:auctionId/bid`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "amount": 150
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "bid": {
      "_id": "bid_id",
      "auction": "auction_id",
      "bidder": "user_id",
      "amount": 150,
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "currentPrice": 150
  }
  ```
- **Error Response (bid too low):**
  ```json
  {
    "success": false,
    "message": "Bid must be higher than current price",
    "statusCode": 400
  }
  ```
- **Error Response (auction not active):**
  ```json
  {
    "success": false,
    "message": "Auction is not active",
    "statusCode": 400
  }
  ```

---

## 4. Socket.IO Events

### Client to Server Events
- `joinAuction(auctionId)` - Join an auction room
- `newBid({ auctionId, bid })` - Place a bid (real-time)
- `auctionEnded(auctionId)` - End an auction (real-time)

### Server to Client Events
- `auctionCreated(auction)` - New auction created
- `userJoined({ userId, auctionId })` - User joined auction
- `bidPlaced({ bid, currentPrice })` - New bid placed
- `auctionEnded({ auctionId, winner, winningBid })` - Auction ended with winner

---

## 5. Error Responses

### General Error Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": []
}
```

### Common Error Codes
- `400` - Bad Request (validation errors, bid too low, etc.)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for action)
- `404` - Not Found (auction not found)
- `500` - Internal Server Error

---

## 6. Testing in Postman

### Environment Variables
Set these in Postman:
- `baseUrl`: `http://localhost:3000/api`
- `auctionId`: (will be set after creating auction)

### Collection Import
Use the JSON collection provided earlier for easy testing.

### Testing Flow
1. Register/Login user
2. Create auction (note the auction ID)
3. Join auction (optional)
4. Place bids
5. End auction (creator only)
6. Check auction details

---

## 7. File Upload Notes

- Images are uploaded to Cloudinary
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 10MB (Cloudinary limit)
- Images are stored in `auctionverse/items` folder on Cloudinary

---

## 8. Real-time Features

All auction actions trigger real-time updates:
- Creating auctions broadcasts to all users
- Joining auctions notifies room participants
- Placing bids updates all participants in real-time
- Ending auctions notifies all participants with winner info

---

## 9. Database Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required unless googleId),
  googleId: String (unique, sparse),
  profilePicture: String,
  wonAuctions: [{
    auction: ObjectId (ref: 'Auction'),
    amount: Number
  }],
  timestamps: true
}
```

### Auction Model
```javascript
{
  title: String (required),
  description: String,
  itemImage: String,
  startingPrice: Number (required),
  currentPrice: Number (required),
  startTime: Date (required),
  createdBy: ObjectId (ref: 'User', required),
  participants: [ObjectId (ref: 'User')],
  status: String (enum: ['active', 'ended', 'upcoming']),
  winner: ObjectId (ref: 'User'),
  winningBid: Number,
  timestamps: true
}
```

### Bid Model
```javascript
{
  auction: ObjectId (ref: 'Auction', required),
  bidder: ObjectId (ref: 'User', required),
  amount: Number (required),
  timestamp: Date (default: Date.now)
}
```

---

## 10. Environment Variables Required

```env
MONGO_URL=mongodb://localhost:27017/auctionverse
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=3000
NODE_ENV=development
```

---

This documentation covers all the endpoints and features of your AuctionVerse backend API!