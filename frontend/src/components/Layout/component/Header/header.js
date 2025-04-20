import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useHeaderLogic() {
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        setUser(loggedInUser);

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartCount(cart.length);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        setUser(null);
        navigate("/");
    };

    const toggleBrandDropdown = () => {
        setIsBrandDropdownOpen(prev => !prev);
    };

    return {
        user,
        cartCount,
        isBrandDropdownOpen,
        toggleBrandDropdown,
        handleLogout
    };
}
