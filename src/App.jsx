import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import BudgetUI from "./pages/Budjet";
import Communal from "./pages/Communal";
import Products from "./pages/Products";
import Prochee from "./pages/Prochee";
import FormirovaniyaZakupa from "./pages/FormirovaniyaZakupa";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/budget" element={<BudgetUI />} />
          <Route path="/communal" element={<Communal />} />
          <Route path="/products" element={<Products />} />
          <Route path="/prochee" element={<Prochee />} />
          <Route path="/formirovaniyaZakupa" element={<FormirovaniyaZakupa />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;