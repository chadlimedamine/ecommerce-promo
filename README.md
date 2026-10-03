<h1 align="center">🛍️ E-commerce Promo API</h1>

<p align="center">
  <b>A promotion-aware shopping cart &amp; checkout backend, built with NestJS, Prisma and PostgreSQL.</b><br/>
  Carts · stackable promo codes · minimum-spend rules · price-snapshotted orders
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REST-API-00897B?style=flat-square" alt="REST API"/>
  <img src="https://img.shields.io/badge/class--validator-DTO_validation-8E44AD?style=flat-square" alt="class-validator"/>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white" alt="ESLint"/>
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black" alt="Prettier"/>
  <img src="https://img.shields.io/badge/Yarn-2C8EBE?style=flat-square&logo=yarn&logoColor=white" alt="Yarn"/>
  <img src="https://img.shields.io/badge/Conventional_Commits-FE5196?style=flat-square&logo=conventionalcommits&logoColor=white" alt="Conventional Commits"/>
</p>

<p align="center">
  <a href="#code-tour">🧭 Code tour</a> ·
  <a href="#architecture">🏗️ Architecture</a> ·
  <a href="#data-model">🗃️ Data model</a> ·
  <a href="#checkout">💸 Checkout engine</a> ·
  <a href="#api">📡 API</a> ·
  <a href="#getting-started">🚀 Getting started</a> ·
  <a href="#roadmap">🗺️ Roadmap</a>
</p>

---

| 📡 **9** | 🗃️ **9** | 🧬 **4** | 🔀 **7** |
|:---:|:---:|:---:|:---:|
| REST endpoints | relational models | versioned DB migrations | merged pull requests |

<a id="code-tour"></a>

## 🧭 Code tour

| Area | Approach | Where to look |
|---|---|---|
| 🧩 **Architecture** | Feature modules (cart, promotion, order) wired with dependency injection; shared infrastructure exposed through `@Global()` modules | [app.module.ts](src/app.module.ts) · [prisma.module.ts](src/modules/prisma/prisma.module.ts) |
| 🗃️ **Data model** | 9 models, 2 enums, junction tables with composite primary keys, a 1-to-1 cart → order link | [schema.prisma](prisma/schema.prisma) |
| 🧬 **Migrations** | 4 incremental migrations, including a non-destructive change that makes the minimum spend optional | [prisma/migrations/](prisma/migrations/) |
| 💸 **Business logic** | Stackable flat discounts, conditional minimum-spend eligibility, frozen order totals | [order.service.ts](src/modules/order/order.service.ts) |
| 🛡️ **Validation** | DTOs with `class-validator`, a global whitelist pipe that blocks mass assignment, `ParseIntPipe` on route params, typed `404` errors | [main.ts](src/main.ts) · [cart/dto/](src/modules/cart/dto/) |
| 🔒 **Type safety** | Prisma-generated client types flow from the schema into every service | [prisma.service.ts](src/modules/prisma/prisma.service.ts) |

> [!TIP]
> **New to the codebase?** Start with [order.service.ts](src/modules/order/order.service.ts). The checkout and promotion engine lives there, and it touches almost every table in the schema.

## ✨ Features

- 🛒 **Cart management**: open a cart for a user, add and remove products, and fetch the active cart with its products and attached promotions.
- 🏷️ **Promo codes**: list promotions, attach them to a cart and detach them. Several promotions can be stacked on one cart.
- 🎯 **Minimum-spend rules**: a promotion can carry an optional `minimumPurchaseAmount`. It is only honoured when the cart subtotal reaches that amount.
- 📦 **Checkout**: turns a cart into an order, copies the line items, computes the totals before and after discount, records which promotions were actually applied, and closes the cart.
- 🧾 **Order lookup**: fetch any order with its products and applied promotions.
- 🛡️ **Strict input boundary**: unknown fields are rejected with `400`, and missing users, carts, products, promotions or orders return a clear `404`.

<a id="architecture"></a>

## 🏗️ Architecture

```mermaid
flowchart LR
    client(["🌐 HTTP client"])

    subgraph app["🐈 NestJS application · port 3000"]
        pipe{{"🛡️ Global ValidationPipe<br/>whitelist · forbidNonWhitelisted"}}

        subgraph features["Feature modules"]
            cartC["CartController<br/>/carts"] --> cartS["CartService"]
            promoC["PromotionController<br/>/promotions"] --> promoS["PromotionService"]
            orderC["OrderController<br/>/orders"] --> orderS["OrderService<br/>💸 promotion engine"]
        end

        subgraph globals["@Global infrastructure"]
            config["⚙️ ConfigModule"]
            prisma["🔺 PrismaService"]
        end
    end

    db[("🐘 PostgreSQL")]

    client -->|JSON| pipe
    pipe --> cartC & promoC & orderC
    cartS & promoS & orderS --> prisma
    config -. DATABASE_URL .-> prisma
    prisma ==>|type-safe queries| db

    classDef ctrl fill:#E0234E,stroke:#9B1735,color:#fff
    classDef svc fill:#7C3AED,stroke:#5B21B6,color:#fff
    classDef infra fill:#2D3748,stroke:#1A202C,color:#fff
    classDef store fill:#336791,stroke:#1F4060,color:#fff
    classDef guard fill:#F59E0B,stroke:#B45309,color:#111
    class cartC,promoC,orderC ctrl
    class cartS,promoS,orderS svc
    class config,prisma infra
    class db store
    class pipe guard
```

Every request passes one validation gate before it reaches a controller. Controllers stay thin and delegate to services. Services share a single injected `PrismaClient`, and the connection string comes from the environment through `ConfigService`, so no secrets live in the code.

<a id="data-model"></a>

## 🗃️ Data model

```mermaid
erDiagram
    User ||--o{ Cart : owns
    User ||--o{ Order : places
    Cart ||--o{ CartItem : contains
    Product ||--o{ CartItem : "added as"
    Cart ||--o| Order : "checked out as"
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : "snapshotted as"
    Cart ||--o{ PromotionAppliedOnCart : "has attached"
    Promotion ||--o{ PromotionAppliedOnCart : "attached to"
    Order ||--o{ PromotionAppliedOnOrder : "discounted by"
    Promotion ||--o{ PromotionAppliedOnOrder : "honoured on"

    User {
        int id PK
        string fullName
        string email
        string passwordHash
    }
    Product {
        int id PK
        string name
        int price
        int amount "stock"
    }
    Cart {
        int id PK
        CartStatus status "ongoing or done"
        int userId FK
    }
    CartItem {
        int id PK
        int cartId FK
        int productId FK
        datetime addedAt
    }
    Order {
        int id PK
        OrderStatus status "pending, payed or shipped"
        int totalPriceBeforeDiscount
        int totalPriceAfterDiscount "nullable"
        int userId FK
        int cartId FK "unique, one order per cart"
    }
    OrderItem {
        int id PK
        int orderId FK
        int productId FK
    }
    Promotion {
        int id PK
        string name
        int flatDiscount
        int minimumPurchaseAmount "nullable"
    }
    PromotionAppliedOnCart {
        int promotionId PK, FK
        int cartId PK, FK
        datetime appliedAt
    }
    PromotionAppliedOnOrder {
        int promotionId PK, FK
        int orderId PK, FK
        datetime appliedAt
    }
```

### 🧠 Design decisions

| | Decision | Why it matters |
|:-:|---|---|
| 🧾 | **A cart is not an order.** At checkout, cart items are copied into `OrderItem` rows and both totals are written to the order. | Later edits to products or carts never rewrite order history. |
| 🏷️ | **Two promotion join tables.** `PromotionAppliedOnCart` holds what the shopper attached. `PromotionAppliedOnOrder` holds what actually qualified. | There is an audit trail of which discounts were honoured, separate from which were only requested. |
| 🔑 | **Composite primary keys** on `(promotionId, cartId)` and `(promotionId, orderId)`. | The database itself refuses to apply the same promotion twice. |
| 1️⃣ | **`@unique` on `Order.cartId`.** | A cart can be checked out into one order at most. |
| 💰 | **Integer money columns.** | No floating-point rounding errors on prices and discounts. |
| 🧬 | **Small, incremental migrations.** For example, `minimumPurchaseAmount` became optional through a `DROP NOT NULL` migration. | The schema grew with the features, and existing data was never lost. |

<a id="checkout"></a>

## 💸 Checkout and promotion engine

### Request flow: `POST /orders`

```mermaid
sequenceDiagram
    autonumber
    actor C as 🧑 Client
    participant P as 🛡️ ValidationPipe
    participant O as 📦 OrderService
    participant DB as 🐘 PostgreSQL

    C->>P: POST /orders { "cartId": 1 }
    alt invalid payload or unknown fields
        P-->>C: 400 Bad Request
    end
    P->>O: createOrder(cartId)
    O->>DB: load cart with items, products and attached promotions
    alt cart not found
        O-->>C: 404 Not Found
    end
    O->>DB: create Order (status = pending)

    rect rgba(224, 35, 78, 0.12)
    loop every CartItem
        O->>DB: copy into OrderItem and add product.price to subtotal
    end
    end

    rect rgba(124, 58, 237, 0.12)
    loop every attached Promotion
        alt eligible (no minimum, or subtotal ≥ minimum)
            O->>DB: record PromotionAppliedOnOrder and subtract flatDiscount
        else not eligible
            Note over O: skipped, not recorded on the order
        end
    end
    end

    O->>DB: Cart.status = done
    O->>DB: Order.status = payed, read back the full order
    O-->>C: 201 Created with items, applied promotions and both totals
```

### Eligibility rules

```mermaid
flowchart TD
    start(["🛒 Checkout starts"]) --> subtotal["Σ subtotal = sum of product prices"]
    subtotal --> next{"Another promotion<br/>attached to the cart?"}
    next -- yes --> hasMin{"minimumPurchaseAmount<br/>set?"}
    hasMin -- no --> apply["✅ Apply<br/>total −= flatDiscount"]
    hasMin -- yes --> meets{"subtotal ≥<br/>minimumPurchaseAmount?"}
    meets -- yes --> apply
    meets -- no --> skip["⏭️ Skip"]
    apply --> record["📝 Record PromotionAppliedOnOrder"]
    record --> next
    skip --> next
    next -- no --> done(["💰 totalPriceAfterDiscount"])

    classDef ok fill:#16A34A,stroke:#166534,color:#fff
    classDef no fill:#DC2626,stroke:#991B1B,color:#fff
    classDef dec fill:#F59E0B,stroke:#B45309,color:#111
    classDef term fill:#7C3AED,stroke:#5B21B6,color:#fff
    class apply,record ok
    class skip no
    class next,hasMin,meets dec
    class start,done term
```

> [!NOTE]
> Eligibility is always checked against the **pre-discount subtotal**. The result is therefore deterministic: it does not depend on the order in which promotions were attached.

**Worked example** (a cart holding 🎧 Headphones at 6 000 and 🖱️ Mouse at 2 000, so the subtotal is **8 000**):

| Promotion | Flat discount | Minimum spend | Result |
|---|---:|---:|---|
| `WELCOME` | 500 | none | ✅ applied, no minimum |
| `SPEND50` | 1 000 | 5 000 | ✅ applied, 8 000 ≥ 5 000 |
| `BIGSPENDER` | 3 000 | 10 000 | ❌ skipped, 8 000 < 10 000 |
| | | **Total** | **8 000 → 6 500** |

### Lifecycles

```mermaid
stateDiagram-v2
    direction LR
    state Cart {
        [*] --> ongoing: POST /carts
        ongoing --> ongoing: add or remove items and promotions
        ongoing --> done: POST /orders
        done --> [*]
    }
    state Order {
        [*] --> pending: created at checkout
        pending --> payed: totals computed
        payed --> shipped: 🔜 planned
        shipped --> [*]
    }
```

<a id="api"></a>

## 📡 API reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Body | Description |
|:-:|---|---|---|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/carts` | `{ "userId": 1 }` | Open a new `ongoing` cart for a user |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/carts/:id` | `{ "productId": 1 }` | Add a product to a cart |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/carts/current` | | Get the active cart with its products and attached promotions |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/carts/:cartId/items/:cartItemId` | | Remove an item from a cart |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/promotions` | | List all promotions |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/promotions/:promotionId` | `{ "cartId": 1 }` | Attach a promotion to a cart |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/promotions/:promotionId` | `{ "cartId": 1 }` | Detach a promotion from a cart |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders` | `{ "cartId": 1 }` | **Check out**: build the order, apply eligible promotions, close the cart |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/orders/:orderId` | | Get an order with its products and applied promotions |

**Errors**

| Status | When |
|:-:|---|
| 🟠 `400` | The body is missing a field, has the wrong type, or contains a field the DTO does not declare. A route parameter is not an integer. |
| 🔴 `404` | The referenced user, cart, cart item, product, promotion or order does not exist. |

```bash
# Unknown fields are rejected, not silently ignored (protection against mass assignment)
curl -X POST localhost:3000/orders -H "Content-Type: application/json" \
     -d '{ "cartId": 1, "isAdmin": true }'
# → 400 { "message": ["property isAdmin should not exist"], "error": "Bad Request", "statusCode": 400 }
```

<a id="getting-started"></a>

## 🚀 Getting started

### Prerequisites

- 🟢 Node.js 18 or later, and Yarn
- 🐘 PostgreSQL (local install or Docker)

### 1. Clone and install

```bash
git clone https://github.com/chadlimedamine/ecommerce-promo.git
cd ecommerce-promo
yarn install
```

### 2. Configure the database

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_promo?schema=public"
```

No PostgreSQL at hand? Start one with Docker:

```bash
docker run --name ecommerce-promo-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ecommerce_promo -p 5432:5432 -d postgres:16
```

### 3. Apply the migrations

```bash
yarn prisma:dev:deploy   # runs the 4 migrations
yarn prisma:generate     # generates the typed Prisma client
```

### 4. Add sample data

Endpoints for creating users, products and promotions are on the [roadmap](#roadmap). For now, add rows with **Prisma Studio** (`yarn prisma:studio`) or run the SQL below in any SQL client.

<details>
<summary>🌱 <b>Sample seed SQL</b> (matches the worked example above)</summary>

```sql
INSERT INTO "User" ("fullName", "email", "passwordHash", "updatedAt")
VALUES ('Ada Lovelace', 'ada@example.com', 'not-a-real-hash', NOW());

INSERT INTO "Product" ("name", "price", "amount")
VALUES ('Headphones', 6000, 10),
       ('Mouse',      2000, 25);

INSERT INTO "Promotion" ("name", "flatDiscount", "minimumPurchaseAmount")
VALUES ('WELCOME',    500,  NULL),
       ('SPEND50',    1000, 5000),
       ('BIGSPENDER', 3000, 10000);
```

</details>

### 5. Run

```bash
yarn start:dev
# listening on port 3000
```

### 🧪 Try the full flow

```bash
H="Content-Type: application/json"

curl -X POST localhost:3000/carts        -H "$H" -d '{ "userId": 1 }'     # 🛒 open cart #1
curl -X POST localhost:3000/carts/1      -H "$H" -d '{ "productId": 1 }'  # 🎧 add headphones
curl -X POST localhost:3000/carts/1      -H "$H" -d '{ "productId": 2 }'  # 🖱️ add mouse
curl -X POST localhost:3000/promotions/1 -H "$H" -d '{ "cartId": 1 }'     # 🏷️ WELCOME
curl -X POST localhost:3000/promotions/2 -H "$H" -d '{ "cartId": 1 }'     # 🏷️ SPEND50
curl -X POST localhost:3000/promotions/3 -H "$H" -d '{ "cartId": 1 }'     # 🏷️ BIGSPENDER
curl -X POST localhost:3000/orders       -H "$H" -d '{ "cartId": 1 }'     # 📦 check out
```

```jsonc
{
  "id": 1,
  "status": "payed",
  "cartId": 1,
  "totalPriceBeforeDiscount": 8000,
  "totalPriceAfterDiscount": 6500,
  "promotionAppliedOnOrder": [
    { "promotionId": 1, "promotion": { "id": 1, "name": "WELCOME", "flatDiscount": 500, "minimumPurchaseAmount": null } },
    { "promotionId": 2, "promotion": { "id": 2, "name": "SPEND50", "flatDiscount": 1000, "minimumPurchaseAmount": 5000 } }
  ]
  // order items, timestamps and counts are trimmed here
}
```

### 📜 Useful scripts

| Command | What it does |
|---|---|
| `yarn start:dev` | 🔁 Start in watch mode |
| `yarn build` then `yarn start:prod` | 🏭 Production build and run |
| `yarn prisma:dev:deploy` | 🧬 Apply all migrations |
| `yarn prisma:generate` | 🔺 Regenerate the Prisma client |
| `yarn prisma:studio` | 🖥️ Open a GUI for the database |
| `yarn lint` / `yarn format` | 🧹 ESLint and Prettier |

## 📁 Project structure

```text
src/
├── main.ts                 # bootstrap and global ValidationPipe
├── app.module.ts           # root module wiring
└── modules/
    ├── cart/               # 🛒 carts and cart items
    │   ├── dto/            #    validated request bodies
    │   ├── cart.controller.ts
    │   └── cart.service.ts
    ├── promotion/          # 🏷️ attach and detach promotions
    ├── order/              # 📦 checkout and promotion engine
    ├── product/            # 🧱 scaffolded, CRUD on the roadmap
    └── prisma/             # 🔺 global PrismaService
prisma/
├── schema.prisma           # 9 models, 2 enums
└── migrations/             # 4 versioned SQL migrations
```

## 🌿 Development workflow

The project was built in small feature branches, each merged into `master` through a pull request (simplified view):

```mermaid
%%{init: { 'gitGraph': { 'mainBranchName': 'master' } } }%%
gitGraph
    commit id: "NestJS scaffold"
    branch prisma
    commit id: "Prisma setup"
    checkout master
    merge prisma tag: "PR #1"
    branch design-db
    commit id: "DB schema"
    commit id: "module boilerplate"
    checkout master
    merge design-db tag: "PR #2"
    checkout design-db
    commit id: "promotion model"
    commit id: "cart endpoints"
    checkout master
    merge design-db tag: "PR #3"
    checkout design-db
    commit id: "promo on cart"
    commit id: "checkout + discounts"
    checkout master
    merge design-db tag: "PR #4"
    checkout design-db
    commit id: "optional minimum"
    checkout master
    merge design-db tag: "PR #5"
    checkout design-db
    commit id: "current cart"
    checkout master
    merge design-db tag: "PR #6"
    checkout design-db
    commit id: "validation fixes"
    checkout master
    merge design-db tag: "PR #7"
```

<a id="roadmap"></a>

## 🗺️ Roadmap

- [x] Relational schema and versioned migrations
- [x] Cart management
- [x] Promotions with an optional minimum spend
- [x] Checkout with stacked discounts and frozen totals
- [ ] 🔐 **JWT authentication**: `@nestjs/passport`, `passport-jwt` and `bcrypt` are already installed and `User` has a `passwordHash` column. Next step: scope carts and orders to the signed-in user.
- [ ] 📦 **Admin endpoints** for products, users and promotions
- [ ] ⚛️ **Atomic checkout**: run the whole checkout inside one `prisma.$transaction`, so it fully succeeds or fully rolls back
- [ ] 🧯 **Exception filter** that maps Prisma errors to HTTP codes (`P2002` → `409 Conflict`, `P2025` → `404`)
- [ ] 📉 **Inventory**: decrement `Product.amount` at checkout, and never let a discounted total go below 0
- [ ] 🧪 **Tests**: unit tests for the promotion engine and an e2e suite with Supertest (Jest is already configured)
- [ ] 📘 **Swagger / OpenAPI** documentation
- [ ] 🐳 **Docker Compose** for a one-command local setup

## 👤 Author

**Mohamed Amine Chadli**

[![GitHub](https://img.shields.io/badge/GitHub-chadlimedamine-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/chadlimedamine)

<p align="center">⭐ If you found this project interesting, feel free to star it!</p>
