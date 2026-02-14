import { Link } from "react-router-dom";

import "./Css/ResponsiveNavbarBottom.css";


export const ResponsiveNavbarBottom = () => {
  return (
    <div className="res-navbar-bttm d-none align-items-center justify-content-between bg-white fixed-bottom w-100">
        <div className="dwsfwwer ahudjkhudfher px-4 py-2 text-center">
            <Link to="/">
                <i class="bi mb-1 bi-house-door-fill"></i>

                <p className="mb-0">Home</p>
            </Link>
        </div>

        <div className="dwsfwwer px-4 py-2 text-center">
            <i class="bi mb-1 bi-search"></i>

            <p className="mb-0">Search</p>
        </div>

        <div className="dwsfwwer px-4 py-2 text-center">
            <i class="bi bi-person"></i>

            <p className="mb-0">Login</p>
        </div>

        <div className="dwsfwwer px-4 py-2 text-center">
            <i class="bi mb-1 bi-whatsapp"></i>

            <p className="mb-0">Whatsapp</p>
        </div>
    </div>
  )
}