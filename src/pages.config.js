import Account from './pages/Account';
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
    "Account": Account,
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