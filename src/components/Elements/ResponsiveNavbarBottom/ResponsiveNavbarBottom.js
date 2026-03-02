import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Css/ResponsiveNavbarBottom.css";


export const ResponsiveNavbarBottom = ({ setResSearchToggle, setResSignBottom }) => {

    const { user } = useAuth();

  return (
    <div className="res-navbar-bttm d-none align-items-center justify-content-between bg-white fixed-bottom w-100">
        <div className="dwsfwwer ahudjkhudfher mx-4 py-2 text-center">
            <Link to="/">
                <i class="bi mb-1 bi-house-door-fill"></i>

                <p className="mb-0">Home</p>
            </Link>
        </div>

        <div className="dwsfwwer mx-4 py-2 text-center" onClick={() => setResSearchToggle(prev => !prev)}>
            <i class="bi mb-1 bi-search"></i>

            <p className="mb-0">Search</p>
        </div>
         {user ? (
            <Link to="/profile" className="dwsfwwer mx-4 py-2 text-center text-decoration-none">
                <i class="bi bi-person"></i>

                <p className="mb-0">Profile</p>
            </Link>
         ):(
            <div onClick={() => setResSignBottom(true)} className="dwsfwwer mx-4 py-2 text-center">
                <i class="bi bi-person"></i>

                <p className="mb-0">Login</p>
            </div>
         )}

        <div className="dwsfwwer mx-4 py-2 text-center">
            <i class="bi mb-1 bi-whatsapp"></i>

            <p className="mb-0">Whatsapp</p>
        </div>
    </div>
  )
}