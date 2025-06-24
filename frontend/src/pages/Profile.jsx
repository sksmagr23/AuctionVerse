import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-center mt-8">You must be logged in to view your profile.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded p-8 mt-8">
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={user.profilePicture || '/avatar.png'}
          alt={user.username}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold">{user.username}</h2>
          <p className="text-gray-600 text-lg">{user.email}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Auctions Won</h3>
      {user.wonAuctions && user.wonAuctions.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {user.wonAuctions.map((won, idx) => (
            <li key={idx} className="py-3 flex justify-between items-center">
              <Link to={`/auction/${won.auction}`} className="text-blue-600 hover:underline">
                Auction #{won.auction}
              </Link>
              <span className="font-bold text-green-600">${won.amount}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">You haven't won any auctions yet.</p>
      )}
    </div>
  );
};

export default Profile; 