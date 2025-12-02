Tables:
- Location: DFW is the only one currently supported.
- Listers: Individuals or organizations posting pets for rehoming.
- Packs: Groups of pets listed together (e.g., litters).
- Pets: Individual animals available for rehoming.
- Users: Includes Listers, Admins (which are also listers with escalated privileges). Visitors do not need accounts.

## Location
- id (PK)
- Landing_page_url (string, unique)
- City
- State
- Timezone
- created_at (timestamp)
- updated_at (timestamp)

## Users
- id (PK, UUID)
- email (string, unique, nullable) -- nullable for Facebook-only users who don't share email
- password_hash (string, nullable) -- null for Facebook OAuth users
- facebook_id (string, unique, nullable) -- null for email/password users
- display_name (string, required)
- profile_photo_url (string, nullable)
- role (enum: 'lister', 'admin') -- default 'lister'
- account_status (enum: 'active', 'suspended', 'deleted') -- default 'active'
- email_verified (boolean) -- default false, true for Facebook
- created_at (timestamp)
- updated_at (timestamp)
- last_login_at (timestamp, nullable)

## Listers
- id (PK, FK to Users.id)
- User_id (FK to Users.id)
- contact_preferences (json) -- e.g., "preferred_method": "facebook", "email": true, "phone": false
- location_id (FK to Location.id)
- is_published (boolean) -- whether the lister's listings are publicly visible
- created_at (timestamp)
- updated_at (timestamp)
 
## Packs
- id (PK)
- lister_id (FK to Listers.id)
- Description (text)
- created_at (timestamp)
- updated_at (timestamp)

## Pets
- id (PK)
- pack_id (FK to Packs.id, nullable) -- null for single pet listings
- Status (enum: 'available', 'reserved', 'sold', 'custom_date', 'hidden')
- custom_availability_date (date, nullable)
- expiry_date (date)
- Description (text)
- Photos: cloudinary_public_ids (json) -- array of Cloudinary public IDs
- created_at (timestamp)
- updated_at (timestamp)
- name (string)
- age (enum: 'less than 8 months', '8-12 months', '1-3 years', '4-7 years', '8+ years')
- breed (string)
- size (enum: 'small', 'medium', 'large', 'extra_large')

## ListingViews
- id (PK)
- pet_id (FK to Pets.id, nullable)
- pack_id (FK to Packs.id, nullable)
- viewer_ip (string, hashed)
- viewed_at (timestamp)


# Fields to add Later
Pet
- Receipt_id: (FK to Receipt.id, nullable)

```prisma
model Receipt {
  id                String   @id @default(uuid())
  user_id           String   // FK to Users.id (who paid)
  paypal_order_id   String   // PayPal's unique order/transaction ID
  amount            Decimal  // Payment amount (e.g., 5.00)
  currency          String   // e.g., 'USD'
  status            String   // e.g., 'completed', 'pending', 'refunded', 'failed'
  paid_at           DateTime // When payment was completed
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  user   Users   @relation(fields: [user_id], references: [id])
}
```


