import { Header, Footer, ScrollToTop } from "./components";
import { AllRoutes } from "./routes/AllRoutes.js";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/bootstrap/dist/js/bootstrap.js";
import './App.css';

function App() {
  const {pathname} = useLocation();
  const hideHeaderRoutes = [];
  const hideFullHeaderFooterRoutes = ["/invoice", "/blog"];
  const hideHeaderCategoryRoutes = ["/cart"];

  const shouldHideHeader = hideHeaderRoutes.includes(pathname);
  const shouldHideFullHeaderFooterRoutes = hideFullHeaderFooterRoutes.includes(pathname) || pathname.startsWith("/blog/");
  const shouldHideHeaderCategoryRoutes = hideHeaderCategoryRoutes.includes(pathname);

  return (
    <div className="App">

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 9999999999 }}
      />

      <Header shouldHideHeader={shouldHideHeader} shouldHideFullHeaderFooterRoutes={shouldHideFullHeaderFooterRoutes} shouldHideHeaderCategoryRoutes={shouldHideHeaderCategoryRoutes} />

      <main className={["/profile", "/change-password", "/cancelled-order", "/order-history", "/wishlist", "/chat"].includes(pathname)
        ? "" 
        : ""}>
        <AllRoutes />
      </main>

      <Footer shouldHideFullHeaderFooterRoutes={shouldHideFullHeaderFooterRoutes} /> 

      <ScrollToTop />
    </div>
  );
}

export default App;