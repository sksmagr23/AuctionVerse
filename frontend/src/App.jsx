import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PageTop from './components/PageTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import AuctionList from './pages/AuctionList';
import Lobby from './pages/Lobby';
import NotificationProvider from './components/NotificationProvider';

function App() {
  return (
    <Router>
    <PageTop />
      <NotificationProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="auction/:id" element={<AuctionDetail />} />
          <Route
            path="auctions/new"
            element={
              <PrivateRoute>
                <CreateAuction />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="lobby/:id"
            element={
              <PrivateRoute>
                <Lobby />
              </PrivateRoute>
            }
          />
          <Route path="auctions" element={<AuctionList />} />
        </Route>
      </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;