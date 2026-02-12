import { Link } from "react-router-dom";
import "./Css/DropdownLoggedIn.css";
import { useAuth } from "../../../context/AuthContext";

export const DropdownLoggedIn = () => {

  // const navigate = useNavigate();
  // eslint-disable-next-line
  const { user, dispatch } = useAuth(); // ✅ Access logout and user from context

  const handleLogout = () => {

    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");

    dispatch({ type: "LOGOUT" });
    // navigate("/login");
    
    // logout();           
    // navigate("/login"); 
  };

  return (
    <div className="dropdown-loggedin bg-white position-absolute p-2 mt-1">
        <ul className="ps-0 mb-0">
            <li><Link to="/profile"><i class="fa-solid fa-user"></i> My Profile</Link></li>
            
            <li><Link to={'/wishlist'}><i class="fa-regular fa-heart"></i> Wishlist</Link></li>

            <li><Link to={'/order-history'}><i class="fa-solid fa-clock-rotate-left"></i> Order History</Link></li>

            <li onClick={handleLogout}><i class="fa-solid fa-right-from-bracket"></i> Logout</li>            
        </ul>
    </div>
  )
}