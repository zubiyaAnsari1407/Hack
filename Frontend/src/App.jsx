import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import PurchaseDetails from "./pages/PurchaseDetails";
import Receipts from "./pages/Receipts";
import Warranties from "./pages/Warranties";
import Returns from "./pages/Returns";
import Analytics from "./pages/Analytics";
import Assistant from "./pages/Assistant";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/purchases"
          element={
            <Layout>
              <Purchases />
            </Layout>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <Layout>
              <PurchaseDetails />
            </Layout>
          }
        />
        <Route
          path="/receipts"
          element={
            <Layout>
              <Receipts />
            </Layout>
          }
        />
        <Route
          path="/warranties"
          element={
            <Layout>
              <Warranties />
            </Layout>
          }
        />
        <Route
          path="/returns"
          element={
            <Layout>
              <Returns />
            </Layout>
          }
        />
        <Route
          path="/analytics"
          element={
            <Layout>
              <Analytics />
            </Layout>
          }
        />
        <Route
          path="/assistant"
          element={
            <Layout>
              <Assistant />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;