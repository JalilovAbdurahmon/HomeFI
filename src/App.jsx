import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/PanelUpravleniya-Papka/Home";
import Communal from "./pages/Communal-Papka/Communal";
import Products from "./pages/Products-Papka/Products";
import Prochee from "./pages/Prochee-Papka/Prochee";
import FormirovaniyaZakupa from "./pages/FormirovaniyaZakupa";
import CommunalAll from "./pages/Communal-Papka/CommunalAll";
import Register from "./pages/Register";
import ProfileSettings from "./pages/ProfileSettings";
import IncomePage from "./pages/Products-Papka/ProductsIncome";
import HomeChecks from "./pages/PanelUpravleniya-Papka/HomeChecks";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/homeChecks" element={<HomeChecks />} />
          <Route path="/communal" element={<Communal />} />
          <Route path="/communal/all/:type?" element={<CommunalAll />} />
          <Route path="/products" element={<Products />} />
          <Route path="/prochee" element={<Prochee />} />
          <Route path="/formirovaniyaZakupa" element={<FormirovaniyaZakupa />} />
          <Route path="/profileSettings" element={<ProfileSettings />}/>
          <Route path="/settings" element={<Settings />}/>
          <Route path="/productsIncome" element={<IncomePage />}/>
        </Route>
      </Routes>
    </div>
  );
};

export default App;