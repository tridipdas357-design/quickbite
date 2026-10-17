import { useState, useReducer } from "react";

// ---------- Data ----------
const MENU = [
  { id: 1, name: "Margherita Pizza", category: "Pizza", price: 249, desc: "Tomato, mozzarella, fresh basil." },
  { id: 2, name: "Paneer Tikka Pizza", category: "Pizza", price: 299, desc: "Smoky paneer, onion, capsicum." },
  { id: 3, name: "Veg Burger", category: "Burgers", price: 129, desc: "Crisp patty, lettuce, house sauce." },
  { id: 4, name: "Chicken Burger", category: "Burgers", price: 169, desc: "Grilled chicken, cheese, pickles." },
  { id: 5, name: "Hakka Noodles", category: "Chinese", price: 159, desc: "Wok-tossed noodles with veggies." },
  { id: 6, name: "Manchurian", category: "Chinese", price: 149, desc: "Dry veg manchurian, spicy garlic." },
  { id: 7, name: "Cold Coffee", category: "Drinks", price: 99, desc: "Thick, chilled, lightly sweet." },
  { id: 8, name: "Fresh Lime Soda", category: "Drinks", price: 59, desc: "Sweet, salted, or mixed." },
];
const CATEGORIES = ["All", ...new Set(MENU.map((m) => m.category))];

// ---------- Cart reducer ----------
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const found = state.find((i) => i.id === action.item.id);
      if (found) return state.map((i) => (i.id === found.id ? { ...i, qty: i.qty + 1 } : i));
      return [...state, { ...action.item, qty: 1 }];
    }
    case "INC":
      return state.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i));
    case "DEC":
      return state
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// ---------- Components ----------
function Navbar({ view, setView, count }) {
  return (
    <header className="nav">
      <h1 onClick={() => setView("menu")}>QuickBite</h1>
      <nav>
        <button className={view === "menu" ? "active" : ""} onClick={() => setView("menu")}>Menu</button>
        <button className={view === "cart" ? "active" : ""} onClick={() => setView("cart")}>
          Cart ({count})
        </button>
      </nav>
    </header>
  );
}

function FoodCard({ item, onAdd, onOpen }) {
  return (
    <div className="card">
      <h3>{item.name}</h3>
      <p className="muted">{item.category}</p>
      <p className="price">₹{item.price}</p>
      <div className="row">
        <button className="ghost" onClick={() => onOpen(item)}>Details</button>
        <button onClick={() => onAdd(item)}>Add</button>
      </div>
    </div>
  );
}

function MenuView({ onAdd, onOpen }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const shown = MENU.filter(
    (m) =>
      (category === "All" || m.category === category) &&
      m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section>
      <div className="toolbar">
        <input
          placeholder="Search dishes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c} className={c === category ? "chip on" : "chip"} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="muted">No dishes match. Clear the search or pick another category.</p>
      ) : (
        <div className="grid">
          {shown.map((m) => (
            <FoodCard key={m.id} item={m} onAdd={onAdd} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

function DetailView({ item, onAdd, onBack }) {
  return (
    <section className="panel">
      <button className="ghost" onClick={onBack}>Back to menu</button>
      <h2>{item.name}</h2>
      <p className="muted">{item.category}</p>
      <p>{item.desc}</p>
      <p className="price">₹{item.price}</p>
      <button onClick={() => onAdd(item)}>Add to cart</button>
    </section>
  );
}

function CartView({ cart, dispatch, onCheckout, onBack }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (cart.length === 0)
    return (
      <section className="panel">
        <h2>Your cart is empty</h2>
        <button onClick={onBack}>Browse menu</button>
      </section>
    );

  return (
    <section className="panel">
      <h2>Your cart</h2>
      {cart.map((i) => (
        <div className="line" key={i.id}>
          <span>{i.name}</span>
          <span className="row">
            <button className="ghost" onClick={() => dispatch({ type: "DEC", id: i.id })}>−</button>
            <b>{i.qty}</b>
            <button className="ghost" onClick={() => dispatch({ type: "INC", id: i.id })}>+</button>
          </span>
          <span>₹{i.price * i.qty}</span>
          <button className="ghost" onClick={() => dispatch({ type: "REMOVE", id: i.id })}>Remove</button>
        </div>
      ))}
      <h3>Total: ₹{total}</h3>
      <button onClick={() => onCheckout(total)}>Place order</button>
    </section>
  );
}

function ConfirmView({ total, onDone }) {
  return (
    <section className="panel">
      <h2>Order placed</h2>
      <p>Your order of ₹{total} is being prepared.</p>
      <button onClick={onDone}>Order more</button>
    </section>
  );
}

// ---------- Root ----------
export default function App() {
  const [view, setView] = useState("menu"); // menu | detail | cart | confirm
  const [selected, setSelected] = useState(null);
  const [lastTotal, setLastTotal] = useState(0);
  const [cart, dispatch] = useReducer(cartReducer, []);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const add = (item) => dispatch({ type: "ADD", item });
  const open = (item) => { setSelected(item); setView("detail"); };
  const checkout = (total) => { setLastTotal(total); dispatch({ type: "CLEAR" }); setView("confirm"); };

  return (
    <div className="app">
      <style>{css}</style>
      <Navbar view={view} setView={setView} count={count} />
      <main>
        {view === "menu" && <MenuView onAdd={add} onOpen={open} />}
        {view === "detail" && selected && (
          <DetailView item={selected} onAdd={add} onBack={() => setView("menu")} />
        )}
        {view === "cart" && (
          <CartView cart={cart} dispatch={dispatch} onCheckout={checkout} onBack={() => setView("menu")} />
        )}
        {view === "confirm" && <ConfirmView total={lastTotal} onDone={() => setView("menu")} />}
      </main>
    </div>
  );
}

const css = `
.app{font-family:system-ui,sans-serif;max-width:900px;margin:0 auto;padding:16px;color:#1f2933}
.nav{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e4e7eb;padding-bottom:10px;margin-bottom:16px}
.nav h1{margin:0;font-size:22px;color:#c2410c;cursor:pointer}
.nav nav{display:flex;gap:8px}
button{background:#c2410c;color:#fff;border:0;border-radius:6px;padding:7px 12px;cursor:pointer;font-size:14px}
button:hover{background:#9a3412}
button.ghost{background:#fff;color:#1f2933;border:1px solid #cbd2d9}
button.ghost:hover{background:#f1f5f9}
.nav button:not(.active){background:#fff;color:#1f2933;border:1px solid #cbd2d9}
.toolbar{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
input{padding:8px 10px;border:1px solid #cbd2d9;border-radius:6px;font-size:14px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{background:#fff;color:#1f2933;border:1px solid #cbd2d9;border-radius:20px}
.chip.on{background:#1f2933;color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.card,.panel{border:1px solid #e4e7eb;border-radius:8px;padding:14px;background:#fff}
.card h3{margin:0 0 4px}
.muted{color:#7b8794;margin:2px 0}
.price{font-weight:700;margin:8px 0}
.row{display:flex;gap:8px;align-items:center}
.line{display:grid;grid-template-columns:1fr auto 70px auto;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #e4e7eb}
`;
