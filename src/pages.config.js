/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import Contact from './pages/Contact';
import Account from './pages/Account';
import AdminData from './pages/AdminData';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Deliveries from './pages/Deliveries';
import Home from './pages/Home';
import ManageBlog from './pages/ManageBlog';
import ManageSubscription from './pages/ManageSubscription';
import MealPlanner from './pages/MealPlanner';
import Meals from './pages/Meals';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import Subscriptions from './pages/Subscriptions';
import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Contact": Contact,
    "Account": Account,
    "AdminData": AdminData,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "Cart": Cart,
    "Checkout": Checkout,
    "Deliveries": Deliveries,
    "Home": Home,
    "ManageBlog": ManageBlog,
    "ManageSubscription": ManageSubscription,
    "MealPlanner": MealPlanner,
    "Meals": Meals,
    "OrderSuccess": OrderSuccess,
    "Orders": Orders,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "SubscriptionCheckout": SubscriptionCheckout,
    "Subscriptions": Subscriptions,
    "Welcome": Welcome,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};