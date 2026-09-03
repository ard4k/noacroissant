# NOA Croissant — Structured Data (JSON-LD) Report

## 1. Overview & Schema Architecture

The NOA Croissant web application implements semantic JSON-LD structured data in `app/layout.tsx` targeting restaurant, bakery, and local food search discovery.

### Schema Graph Summary

| Entity Type | `@id` / Target | Primary Properties |
|---|---|---|
| `Bakery` / `FoodEstablishment` | `https://noacroissant.com/#bakery` | `name`, `description`, `url`, `logo`, `image`, `servesCuisine`, `priceRange`, `currenciesAccepted`, `paymentAccepted`, `address`, `hasMenu` |
| `PostalAddress` | Embedded in `Bakery` | `addressLocality: "Alanya"`, `addressRegion: "Antalya"`, `addressCountry: "TR"` |
| `Menu` | `https://noacroissant.com/#menu` | `name`, `url`, `hasMenuSection` (all 15 categories) |
| `MenuSection` | Nested in `Menu` | Category names (e.g. "NOA Menüler", "Twissy", "Danish", "Tuzlu Kruvasanlar", "Soğuk Kahveler", etc.) |
| `MenuItem` | Nested in `MenuSection` | `name`, `description`, `image`, `offers`, `suitableForDiet: "https://schema.org/HalalDiet"` |
| `Offer` | Nested in `MenuItem` | `price`, `priceCurrency: "TRY"`, `availability: "https://schema.org/InStock"` |

---

## 2. Source of Business Values

* **Business Identity**: "NOA Croissant"
* **Logo**: `https://noacroissant.com/brand/logo.png`
* **Featured Image**: `https://noacroissant.com/noa-croissant.jpg`
* **Cuisines**: French, Bakery, Desserts, Specialty Coffee
* **Payment Accepted**: Cash, Credit Card, Contactless
* **Products & Prices**: Dynamically mapped from `INITIAL_PRODUCTS` and `INITIAL_CATEGORIES`

---

## 3. Missing Fields Requiring Owner Confirmation

| Field | Current Status | Required Action |
|---|---|---|
| `streetAddress` | Omitted (Region: Alanya, Antalya) | Owner to provide exact street, building & door number |
| `telephone` | Omitted from public JSON-LD | Owner to provide official business phone number |
| `geo` (`latitude`, `longitude`) | Omitted | Owner to provide GPS coordinates for local Google Maps map pack pinning |
| `openingHoursSpecification` | Omitted | Owner to confirm weekly opening/closing hours per day |
| `sameAs` | Omitted | Owner to provide official Instagram, Facebook, and Google Business Profile links |

---

## 4. Compliance & Anti-Spam Verification

1. ✅ **No Fake Ratings**: No artificial `AggregateRating` or `Review` schema has been added.
2. ✅ **Truthful Data**: All product names, descriptions, and prices match the on-page Turkish menu.
3. ✅ **No Doorway Pages**: Structured data is unified in the canonical site structure.
4. ✅ **Valid URLs**: All image assets link to real existing paths in `public/`.
