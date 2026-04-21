import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import BudgetUI from "./pages/Budjet";
import Communal from "./pages/Communal-Papka/Communal";
import Products from "./pages/Products-Papka/Products";
import Prochee from "./pages/Prochee-Papka/Prochee";
import FormirovaniyaZakupa from "./pages/FormirovaniyaZakupa";
import CommunalAll from "./pages/Communal-Papka/CommunalAll";
import Register from "./pages/Register";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/budget" element={<BudgetUI />} />
          <Route path="/communal" element={<Communal />} />
          <Route path="/communal/all/:type?" element={<CommunalAll />} />
          <Route path="/products" element={<Products />} />
          <Route path="/prochee" element={<Prochee />} />
          <Route path="/formirovaniyaZakupa" element={<FormirovaniyaZakupa />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;