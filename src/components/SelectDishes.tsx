import Link from "next/link";
import { OrderLink } from "@/components/OrderLink";
import { formatPrice } from "@/lib/format";

export type SelectDishPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type SelectDish = {
  id: number;
  name: string;
  description: string;
  price: string;
  section: string;
  glutenFree: boolean;
  photo: SelectDishPhoto | null;
};

/** Published menu content only; absent matching photography stays a text card. */
export function SelectDishes({ dishes, toastUrl }: { dishes: SelectDish[]; toastUrl: string | null }) {
  if (!dishes.length) return <p>The menu has not been published yet.</p>;
  return (
    <div className="select-dishes">
      <ul className="dish-grid">
        {dishes.map((dish) => (
          <li key={dish.id} className={dish.photo ? "dish-card dish-card--photo" : "dish-card"}>
            {dish.photo ? (
              <figure className="dish-photo">
                <img src={dish.photo.src} alt={dish.photo.alt} width={dish.photo.width} height={dish.photo.height} loading="lazy" />
              </figure>
            ) : null}
            <div className="dish-copy">
              <p className="micro-label">{dish.section}</p>
              <div className="dish-heading">
                <h3>{dish.name}</h3>
                {dish.price ? <span className="price">{formatPrice(dish.price)}</span> : null}
              </div>
              {dish.description ? <p>{dish.description}</p> : null}
              {dish.glutenFree ? <span className="chip">Gluten free</span> : null}
            </div>
          </li>
        ))}
      </ul>
      <div className="dish-actions">
        <Link className="btn btn-ink" href="/menu">Explore the full menu</Link>
        <OrderLink className="text-link" url={toastUrl}>Order online</OrderLink>
      </div>
    </div>
  );
}
