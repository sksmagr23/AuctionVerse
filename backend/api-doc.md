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
- **Response:** Redirects to Google's OAuth consent screen.

### Google OAuth Callback
- **Method:** `GET`
- **URL:** `/auth/google/callback`
- **Response:** On success, redirects to the frontend with an authenticated session. On failure, redirects to `/login`.

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

### Get Current User
- **Method:** `GET`
- **URL:** `/auth/user`
- **Headers:** None required (cookie is sent automatically)
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "wonAuctions": []
    }
  }
  ```
- **Error Response (not authenticated):**
  ```json
  {
    "success": false,
    "message": "Not authenticated",
    "statusCode": 401
  }
  ```

### Get User Profile (Detailed)
- **Method:** `GET`
- **URL:** `/auth/profile`
- **Headers:** None required (cookie is sent automatically)
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "profilePicture": "url",
      "wonAuctions": [
        {
          "auction": {
            "_id": "auction_id",
            "title": "Vintage Watch",
            "startTime": "2024-01-01T10:00:00.000Z"
          },
          "amount": 250
        }
      ],
      "createdAuctions": [
        {
          "_id": "auction_id",
          "title": "My Auction",
          "currentPrice": 200,
          "status": "active",
          "startTime": "2024-01-01T10:00:00.000Z"
        },
        {
          "_id": "auction_id2",
          "title": "Old Auction",
          "currentPrice": 100,
          "status": "ended",
          "startTime": "2024-01-01T09:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```
- **Note:**
  - `createdAuctions` always includes all auctions created by the user, regardless of status (`active`, `upcoming`, or `ended`).
  - Each auction in `createdAuctions` includes its current status.

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
- **Constraints:**
  - Start time must be in the future
  - Users must have at least a 1-hour gap between their own auctions
  - Multiple users can create auctions at the same time
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
    "message": "You must have at least a 1-hour gap between your auctions.",
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
- `auctionStarted({ auctionId, auction })` - Auction status changed to active
- `userJoined({ userId, auctionId })` - User joined auction
- `bidPlaced({ bid, currentPrice })` - New bid placed
- `auctionEnded({ auctionId, winner, winningBid })` - Auction ended with winner
- `auctionsUpdated()` - General auction list update (refresh recommended)

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

## 6. Database Models

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