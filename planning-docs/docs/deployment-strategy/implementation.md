Roles:
- Admin
- Visitors
- Listers


Listers:
- They should see Listener landing page


UI Elements:
- Pet Thumbnail:
    - Photo
    - Name
    - Red X through photo if sold
    - Warning emoji if reserved
    - Edit button (Lister only)
    - Note: Thumbnail is not visible to visitors if status is hidden
    - Thumbnail is ALWAYS visible to lister.
    - Clicking thumbnail opens the Pack's URL

- Pet Details:
    - Pet thumbnail
    - Pet details:
        - Name
        - Age
        - Breed
        - Size
        - Description
        - Availablility Date
        - Expiry Date
    - If the Lister of the pet is viewing, show an edit button that can switch to pet details edit mode.

- Pet details Edit:
    - Form to edit all pet details
    - Upload photos button (integrated with Cloudinary upload widget)
    - Delete pet button
    - Link to receipt if paid, or indicator if they haven't paid for the pet yet.
    - Only the lister see this view.

- Pack View:
    - Pack Details:
        - Sellers name
        - Pack Description (don't show text or label if empty)
        - Created At (n days ago)
        - Sellers contact info
        - Link to 
    - For each pet in pack, show Pet Details

- Lister landing page:
    - Form to enter contact preferences
    - Show list of packs with edit buttons
    - Button to create new packs with 1 or more pets

- Pack editing page:
    - Form to edit pack name.
    - Form to edit pack description.
    - Checkbox to disable pack description. Useful if there is only one pet.
    - Button to add new pet to pack, which adds a new pet details edit form.
    - For each pet in pack, show pet details. When they click the details, it switches to pet details edit mode.
    - If new pet is added show a paypal checkout with a quantity.
    - Link to receipt and quantity of pets in the receipt

- Checkout page:
    - Show PayPal button to pay for listing fee
    - Show all pets being listed (details)
    - Show total amount to be paid

- Receipt page:
    - Show list of purchased pets with their names and thumbnails
    - Show total amount paid
    - Show date of purchase
    - Show lister contact info for each pet
    - Show link to each pet's pack page

- Visitor landing page:
    - Search bar to search for pets by name, breed, age, size
    - Filters for age, size, breed
    - Sort by newest, oldest, expiring soon
    - Show list of pet thumbnails. Clicking a thumbnail opens the pack view.
    - Don't show pets that are hidden or expiry date is in the past.

- Cloudinary upload widget:
    - Allow listers to upload multiple photos for each pet
    - Show thumbnails of uploaded photos with option to delete or reorder

- Admin page:
    - Show list of all users
    - Show list of all listers
    - Show list of all packs and pets
    - Ability to delete any pet, pack, or user
    - Ability to change pet status (available, reserved, sold, hidden)
    - Ability to lock a user account


Cloudinary Environment Variables:
CLOUDINARY_URL=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

