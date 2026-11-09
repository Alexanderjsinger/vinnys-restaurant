export type LunchSeedItem = {
  name: string;
  description: string;
  price: string;
  glutenFree?: boolean;
  marked?: boolean;
};

export type LunchSeedSection = {
  name: string;
  blurb: string;
  items: LunchSeedItem[];
};

export const LUNCH_SERVICE = "Lunch daily 11–3pm";

export const LUNCH_FOOTNOTE =
  "Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions.";

export const LUNCH_MENU: LunchSeedSection[] = [
  {
    name: "Appetizer",
    blurb: "",
    items: [
      {
        name: "BAVARIAN PRETZEL",
        description: "Ale cheddar dip, honey mustard sauce",
        price: "14",
      },
      {
        name: "SPICY CAULIFLOWER",
        description: "Sriracha honey glaze, scallions, pear slaw",
        price: "12",
        glutenFree: true,
      },
      {
        name: "CHICKEN SATAY",
        description: "Tahini yogurt, sriracha glaze, sesame seeds, scallions",
        price: "14",
        glutenFree: true,
      },
      {
        name: "WINGS (8)",
        description: "Choice of buffalo, sweet & spicy or Nashville butter, served with carrots, celery and ranch",
        price: "16",
        glutenFree: true,
      },
    ],
  },
  {
    name: "Salads",
    blurb: "add chicken, shrimp, or salmon for $6",
    items: [
      {
        name: "SOUTHERN CHICKEN SALAD",
        description: "Romain lettuce,corn,red peppers,red onions,avocado,tortilla strips, cilantro lime vinaigrette",
        price: "16",
      },
      {
        name: "HOUSE SALAD",
        description: "Mixed greens,cherry tomatoes,dried cranberries,shallots,candied pecans,goat cheese,raspberry vinaigrette",
        price: "12",
        glutenFree: true,
      },
      {
        name: "KALE SALAD",
        description: "Roasted butternut squash,green apples,goat cheese,spiced almonds,tahini maple vinaigrette",
        price: "12",
        glutenFree: true,
      },
      {
        name: "CAESAR SALAD",
        description: "Romaine lettuce,parmesan,croutons,crispy capers",
        price: "10",
      },
    ],
  },
  {
    name: "Soup of the Day",
    blurb: "",
    items: [{ name: "Soup of the Day", description: "", price: "8" }],
  },
  {
    name: "Pizza",
    blurb: "",
    items: [
      {
        name: "MARGHERITA",
        description: "Brick cheese,basil, lemon olive oil",
        price: "14",
      },
      {
        name: "FIG AND PEAR",
        description: "Fig jam,asian pear,blue cheese,arugula,balsamic glaze",
        price: "15",
      },
      {
        name: "PEPPERONIE",
        description: "Cupped pepperonie, brick cheese",
        price: "14",
      },
      {
        name: "VEGGIE",
        description: "Brick cheese,mushrooms,onions,peppers",
        price: "14",
      },
    ],
  },
  {
    name: "Handhelds",
    blurb: "served with fries, potato chips or house salad",
    items: [
      {
        name: "ARTISAN CHICKEN SANDWICH",
        description: "Applewood bacon,brie cheese,apricot jam,arugula on ciabatta",
        price: "16",
      },
      {
        name: "NASHVILLE CHICKEN SANDWICH",
        description: "Buttermilk fried chicken,apple slaw,Nashville hot butter,pickles",
        price: "15",
      },
      {
        name: "TURKEY & PASTRAMI",
        description: "Swiss cheese,green apples,honey mustard on marble rye",
        price: "15",
      },
      {
        name: "AVOCADO BLT",
        description: "Avocado mash,heirloom tomatoes,arugula,lemon olive on sourdough",
        price: "14",
      },
      {
        name: "VINNY'S BURGER",
        description: "½ pound grass fed beef pattie,cheddar,bourbon bacon jam,LTO, Vinny's sauce on brioche bun",
        price: "16",
        marked: true,
      },
      {
        name: "THE CLASSIC",
        description: "½ pound grass fed beef pattie,cheddar,garlic aioli, lettuce,onions,tomatoes on brioche",
        price: "14",
        marked: true,
      },
      {
        name: "FRENCH DIP",
        description: "Shaved roast beef,swiss cheese,Montreal aioli,crispy onions,au jus",
        price: "16",
        marked: true,
      },
      {
        name: "BLACK BEAN BURGER",
        description: "avocado mash,swiss cheese,crispy onions,lettuce, tomatoes on brioche",
        price: "14",
      },
      {
        name: "GRILLED CHEESE",
        description: "Cheddar,swiss,brie on sourdough",
        price: "12",
      },
    ],
  },
  {
    name: "Combo Lunch",
    blurb: "",
    items: [
      {
        name: "SOUP & HALF SALAD",
        description: "Soup of the day with choice of caesar,kale or house sald",
        price: "15",
      },
      {
        name: "½ SALAD & ½ SANDWICH",
        description:
          "Choice of caesar, kale, or house salad with choice of artisan chicken, turkey & pastrami, avocado BLT, or french dip",
        price: "15",
      },
      {
        name: "SOUP & ½ SANDWICH",
        description: "Soup of the day with choice artisan chicken, turkey & pastrami, avocado BLT,or french dip",
        price: "15",
      },
    ],
  },
];

export const PREVIOUS_PROMO_BODY =
  "A neighborhood bar and grill for lunch and dinner. Call the restaurant while online ordering and reservations are connected.";

export const LUNCH_PROMO_BODY =
  "Lunch is served daily, 11–3pm. Call the restaurant while online ordering and reservations are connected.";
