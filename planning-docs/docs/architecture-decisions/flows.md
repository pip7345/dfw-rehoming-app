# Application Flows

This document describes the main user flows and data flows in the DFW Dog Rehoming application.

## User Registration & Authentication Flow

1. User visits `/register`
2. User enters email, password, display name, and phone
3. System creates:
   - User account in `users` table
   - Associated Lister record in `listers` table
4. User is redirected to login page
5. User logs in at `/login` with email and password
6. Passport.js authenticates and creates session
7. User is redirected to `/dashboard`

## Create Pack & Pets Flow (New Listing)

### Phase 1: Temporary Pet Creation
1. User navigates to `/create-pack`
2. User enters pack name and description (optional)
3. User clicks "Add Pet" button
4. Pet edit modal opens with empty form
5. User uploads photos via Cloudinary widget
6. User enters pet details (name, breed, age, size, status, description, expiry date)
7. User clicks "Save Pet"
8. Pet data stored in `temporaryPets` array (client-side only, not in database)
9. Pet tile rendered on page
10. User can add multiple pets by repeating steps 3-9

### Phase 2: Database Creation (Unpaid)
1. User clicks "Proceed to Checkout" button
2. System validates at least one pet exists
3. **Pack created in database** via `POST /api/packs`:
   - Status: unpaid (no receipt linked)
   - Returns pack ID
4. **All pets created in database** via `POST /api/pets`:
   - Linked to pack via `pack_id`
   - Status: unpaid (no `Receipt_id`)
   - Photos stored as Cloudinary public IDs
5. Pack and pet IDs stored in sessionStorage
6. User redirected to `/checkout`

### Phase 3: Payment & Completion
See "Checkout & Payment Flow" below.

## Edit Existing Pet Flow

### For Database Pets (Already Saved)
1. User clicks pet tile from dashboard or pack view
2. Pet details modal opens showing pet information
3. User clicks "Edit Pet" button in modal
4. Pet edit modal opens pre-populated with pet data fetched via `GET /api/pets/:id`
5. User modifies pet details
6. User clicks "Save Pet"
7. System updates pet via `PUT /api/pets/:id`
8. Page reloads to show updated pet

### For Temporary Pets (Not Yet Saved)
1. User clicks pet tile on create-pack page
2. Pet edit modal opens pre-populated with temporary pet data (passed as parameter)
3. User modifies pet details
4. User clicks "Save Pet"
5. Temporary pet updated in client-side `temporaryPets` array
6. Pet tile re-rendered with updated data
7. Changes persisted to database when user proceeds to checkout

## Checkout & Payment Flow

### Page Load & Display
1. User arrives at `/checkout` from create-pack page
2. System loads checkout data from sessionStorage
3. **Pet tiles displayed** showing all pets being purchased (with photos)
4. Listing details and price breakdown shown
5. PayPal button and bypass button rendered

### Option 1: PayPal Payment
1. User clicks "Pay with PayPal" or "Debit or Credit Card" button
2. PayPal modal opens (sandbox environment in development)
3. User completes payment with:
   - Test account login, OR
   - Guest credit card (test card: `4111 1111 1111 1111`)
4. PayPal processes payment
5. System calls `POST /api/paypal/capture-order` with:
   - `orderId`: PayPal order ID
   - `petIds`: Array of pet IDs to link
   - `packId`: Pack ID
6. API creates receipt in database:
   - `paypal_order_id`, `amount`, `currency`, `status: 'completed'`
   - Linked to user via `user_id`
7. **All pets updated** via `updateMany`:
   - `Receipt_id` set to new receipt ID
   - Pets now marked as paid
8. Success message displayed
9. SessionStorage cleared
10. User redirected to dashboard

### Option 2: Bypass Payment (Testing Only)
1. User clicks "⚠️ Bypass Payment (Testing Only)" button
2. Confirmation dialog appears
3. User confirms bypass
4. System calls `POST /api/checkout/bypass-payment` with:
   - `packId`: Pack ID
   - `petIds`: Array of pet IDs
   - `receipt`: Dummy receipt data (`TEST-{timestamp}`, test amount)
5. API creates test receipt in database
6. **All pets updated** to link to test receipt
7. Success message displayed
8. SessionStorage cleared
9. User redirected to dashboard

## Browse & Search Pets Flow

1. User visits homepage `/`
2. System fetches all available pets via `GET /api/pets`
3. Pets displayed as tiles with:
   - Primary photo from Cloudinary
   - Name, breed, age, size
4. User can click pet tile to view details
5. Pet details modal opens showing:
   - Large photo (800x600)
   - Full pet information
   - Description
   - Lister contact information (if available)

## Dashboard Flow

1. Authenticated user visits `/dashboard`
2. System checks authentication status
3. If not logged in, redirect to `/login`
4. Dashboard displays:
   - User's packs (via `GET /api/packs` filtered by lister)
   - Pets within each pack
   - Payment status (paid/unpaid)
5. User can:
   - Create new pack (redirect to `/create-pack`)
   - Edit existing pets
   - View receipts (if paid)
   - Delete pets or packs

## Data State Transitions

### Pet States
- **Temporary**: Exists only in client-side array on create-pack page
- **Unpaid**: Exists in database but no `Receipt_id` linked
- **Paid**: Exists in database with `Receipt_id` linked to completed receipt

### Pack States
- **Unpaid**: Pack created without associated receipts for any pets
- **Partially Paid**: Some pets have receipts, others don't (edge case)
- **Fully Paid**: All pets have receipts linked

### Receipt States
- **Pending**: Created but payment not completed (not currently used)
- **Completed**: Payment captured successfully
- **Test**: Created via bypass payment for testing purposes

## Photo Upload Flow

1. User clicks "📷 Upload Photos" in pet edit modal
2. Cloudinary upload widget opens
3. User selects photos from local device or camera
4. Photos uploaded to Cloudinary:
   - Stored in `pets` folder
   - Tagged with `pet`, `listing`
   - Auto-cropped to 4:3 aspect ratio (800x600)
   - Quality optimized
5. Cloudinary returns `public_id` for each photo
6. Public IDs stored in array (`currentEditPetPhotos`)
7. Photo previews rendered (800x600 display)
8. When pet saved, public IDs stored in `cloudinary_public_ids` JSON field
9. Photos displayed via Cloudinary URLs:
   - Thumbnail: `c_fill,w_400,h_300`
   - Full view: `c_fill,w_800,h_600`

## Modal Interactions

### Pet Edit Modal
- **Add Mode**: Empty form, default expiry date (30 days from now)
- **Edit Mode (Database)**: Fetches pet data via API, shows receipt info
- **Edit Mode (Temporary)**: Uses passed `petData` parameter, no receipt info

### Pet Details Modal
- Read-only view of pet information
- Shows "Edit Pet" button if user is the lister
- Clicking edit button opens Pet Edit Modal

## Error Handling

### Authentication Errors
- 401 responses redirect to login page
- Session expiry requires re-authentication

### Payment Errors
- PayPal errors display alert with error message
- Failed payments don't update pet/receipt records
- User can retry payment

### Validation Errors
- Missing required fields prevent form submission
- At least one photo required for pet creation
- Form validation feedback shown via toast notifications

## Session & Storage

### Server Session (Passport.js)
- User authentication state
- Persisted in session store
- Shared across API and web server

### SessionStorage (Client-side)
- `checkoutData`: Pack and pet IDs for checkout
- Cleared after successful payment
- Persists across page refreshes during checkout flow
