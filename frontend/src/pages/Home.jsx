import React, { useState, useEffect } from 'react';
import auctionService from '../services/auction.service';
import AuctionCard from '../components/AuctionCard';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await auctionService.getAllAuctions();
        if (response.data.success) {
          setAuctions(response.data.auctions);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  if (loading) return <p>Loading auctions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Live Auctions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <AuctionCard key={auction._id} auction={auction} />
        ))}
      </div>
    </div>
  );
};

export default Home; 