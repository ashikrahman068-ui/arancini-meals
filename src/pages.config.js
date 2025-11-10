import Home from './pages/Home';
import Meals from './pages/Meals';
import MealPlanner from './pages/MealPlanner';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Subscriptions from './pages/Subscriptions';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import ManageSubscription from './pages/ManageSubscription';
import Deliveries from './pages/Deliveries';
import Welcome from './pages/Welcome';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ManageBlog from './pages/ManageBlog';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Meals": Meals,
    "MealPlanner": MealPlanner,
    "Cart": Cart,
    "Checkout": Checkout,
    "OrderSuccess": OrderSuccess,
    "Orders": Orders,
    "Account": Account,
    "Subscriptions": Subscriptions,
    "SubscriptionCheckout": SubscriptionCheckout,
    "ManageSubscription": ManageSubscription,
    "Deliveries": Deliveries,
    "Welcome": Welcome,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "ManageBlog": ManageBlog,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};