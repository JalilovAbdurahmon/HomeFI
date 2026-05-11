import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/PanelUpravleniya-papka/Home";
import BudgetUI from "./pages/Budjet";
import Communal from "./pages/Communal-Papka/Communal";
import Products from "./pages/Products-Papka/Products";
import Prochee from "./pages/Prochee-Papka/Prochee";
import FormirovaniyaZakupa from "./pages/FormirovaniyaZakupa";
import CommunalAll from "./pages/Communal-Papka/CommunalAll";
import Register from "./pages/Register";
import ProfileSettings from "./pages/ProfileSettings";
import IncomePage from "./pages/Products-Papka/ProductsIncome";
import TransactionHistory from "./pages/PanelUpravleniya-papka/HomeChecks";

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
          <Route path="/profileSettings" element={<ProfileSettings />}/>
          <Route path="/productsIncome" element={<IncomePage />}/>
          <Route path="/homeChecks" element={<TransactionHistory />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;