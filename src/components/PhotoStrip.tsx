import { LUNCH_PLATES } from "@/lib/lunch-photos";

export function PhotoStrip() {
  return (
    <section className="kitchen" aria-label="Lunch dishes">
      <div className="photo-row">
        {LUNCH_PLATES.map((photo) => (
          <figure key={photo.src} className="shot">
            <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
            <figcaption>{photo.menuName}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
