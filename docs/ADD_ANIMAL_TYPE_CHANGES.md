# Adding Animal Type (Dog/Cat/Other) - Required Changes

This document outlines all files and specific areas that need to be updated to add animal type support to pets.

## Overview

Currently, all pets are implicitly dogs. We need to add a `PetType` enum with values `dog`, `cat`, and `other`, and update all relevant files to support this new field.

---

## 1. Database Schema Changes

### File: `prisma/schema.prisma`

**Add new enum after existing enums (around line 48):**
```prisma
enum PetType {
  dog
  cat
  other
}
```

**Add field to Pets model (around line 111, after `age`):**
```prisma
  animal_type              PetType?   @default(dog)
```

---

## 2. Backend Code Changes

### File: `src/core/petsRepo.ts`

**Line 5-7 - Add PetType to type imports:**
```typescript
type PetType = $Enums.PetType;
```

**Lines 9-21 - Add to CreatePetData interface:**
```typescript
  animal_type?: PetType;
```

**Lines 23-35 - Add to UpdatePetData interface:**
```typescript
  animal_type?: PetType;
```

**Lines 36-46 - Add to SearchPetsParams interface:**
```typescript
  animal_type?: PetType;
```

**Lines 63-100 - Add filter in search() method:**
```typescript
if (animal_type) {
  where.AND.push({ animal_type });
}
```

**Lines 139-159 - Add to create() method data:**
```typescript
animal_type: data.animal_type,
```

---

### File: `src/api/pets.ts`

**Line 3 - Add PetType to imports:**
```typescript
import type { PetAge, PetSize, PetType } from '@prisma/client';
```

**Lines 8-32 - Add to GET /search handler:**
- Extract `animal_type` from query params
- Pass to `PetsRepo.search()`

**Lines 47-83 - Add to POST / handler:**
- Extract `animal_type` from req.body
- Pass to `PetsRepo.create()`

**Lines 85-118 - Add to PUT /:id handler:**
- Extract `animal_type` from req.body
- Pass to `PetsRepo.update()`

---

## 3. Seed Script Changes

### File: `prisma/seed.ts`

**Line 107 - Add animal types array:**
```typescript
const animalTypes = ['dog', 'cat', 'other'];
```

**Lines 119-157 - Add animal_type to pet creation:**
- Randomly assign animal_type from array
- Or use distribution: 70% dog, 20% cat, 10% other

---

## 4. Frontend View Changes

### A. Pet Edit Forms (Add Animal Type Dropdown)

#### File: `src/web/views/partials/pet-edit-modal.ejs`

**Around line 127-130 (before breed field) - Add new form group:**
```html
<div class="form-group">
  <label for="edit-pet-animal-type">Animal Type</label>
  <select name="animal_type" id="edit-pet-animal-type">
    <option value="">Select type...</option>
    <option value="dog">🐕 Dog</option>
    <option value="cat">🐱 Cat</option>
    <option value="other">🐾 Other</option>
  </select>
</div>
```

**Around line 214-217 (JavaScript) - Add field population:**
```javascript
document.getElementById('edit-pet-animal-type').value = petData.animal_type || 'dog';
```

---

#### File: `src/web/views/partials/pet-edit-tile.ejs`

**Line 10 - Add variable extraction:**
```javascript
const petType = pet?.animal_type || 'dog';
```

**Around line 58 (before breed field) - Add dropdown:**
```html
<div class="form-group">
  <label for="<%= formId %>-animal-type">Animal Type</label>
  <select id="<%= formId %>-animal-type" name="animal_type">
    <option value="dog" <%= petType === 'dog' ? 'selected' : '' %>>🐕 Dog</option>
    <option value="cat" <%= petType === 'cat' ? 'selected' : '' %>>🐱 Cat</option>
    <option value="other" <%= petType === 'other' ? 'selected' : '' %>>🐾 Other</option>
  </select>
</div>
```

---

#### File: `src/web/views/dashboard.ejs`

**Around line 650-689 (inline dog form) - Add dropdown:**
```html
<div class="form-group">
  <label for="inline-pet-animal-type">Animal Type</label>
  <select id="inline-pet-animal-type" name="animal_type">
    <option value="dog">🐕 Dog</option>
    <option value="cat">🐱 Cat</option>
    <option value="other">🐾 Other</option>
  </select>
</div>
```

---

### B. Pet Display Views (Show Animal Type)

#### File: `src/web/views/partials/pet-tile.ejs`

**Line 8 - Add type-based emoji function:**
```javascript
const getTypeEmoji = (type) => {
  const emojis = { dog: '🐕', cat: '🐱', other: '🐾' };
  return emojis[type] || '🐾';
};
```

**Line 26 - Use dynamic emoji instead of hardcoded 🐕:**
```html
<div class="pet-tile-placeholder"><%= getTypeEmoji(pet.animal_type) %></div>
```

**Around line 53-62 (pet meta tags) - Add animal type tag:**
```html
<% if (pet.animal_type) { %>
  <span class="pet-tile-tag"><%= pet.animal_type %></span>
<% } %>
```

---

#### File: `src/web/views/partials/pet-details-tile.ejs`

**Line 26 - Use dynamic emoji:**
```html
<div class="pet-details-placeholder"><%= pet.animal_type === 'cat' ? '🐱' : pet.animal_type === 'other' ? '🐾' : '🐕' %></div>
```

**Around line 55-63 (pet meta tags) - Add animal type tag:**
```html
<% if (pet.animal_type) { %>
  <span class="pet-details-tag"><%= pet.animal_type %></span>
<% } %>
```

---

#### File: `src/web/views/partials/pet-details-modal.ejs`

**Line 177 - Use dynamic emoji:**
```javascript
${pet.animal_type === 'cat' ? '🐱' : pet.animal_type === 'other' ? '🐾' : '🐕'}
```

**Around line 186-208 (info grid) - Add Animal Type row:**
```html
<div class="pet-info-row">
  <span class="pet-info-label">Type</span>
  <span class="pet-info-value">${pet.animal_type ? pet.animal_type.charAt(0).toUpperCase() + pet.animal_type.slice(1) : 'Dog'}</span>
</div>
```

---

#### File: `src/web/views/receipt.ejs`

**Line 133 - Use dynamic emoji:**
```html
<%= pet.animal_type === 'cat' ? '🐱' : pet.animal_type === 'other' ? '🐾' : '🐕' %>
```

**Around line 140-142 (pet tags) - Add type tag:**
```html
<% if (pet.animal_type) { %><span class="pet-tag"><%= pet.animal_type %></span><% } %>
```

---

### C. Home Page Filters

#### File: `src/web/views/index.ejs`

**Around line 221-234 (search form filters) - Add animal type filter:**
```html
<select name="animal_type" class="filter-select">
  <option value="">All Animals</option>
  <option value="dog" <%= typeof filters !== 'undefined' && filters.animal_type === 'dog' ? 'selected' : '' %>>🐕 Dogs</option>
  <option value="cat" <%= typeof filters !== 'undefined' && filters.animal_type === 'cat' ? 'selected' : '' %>>🐱 Cats</option>
  <option value="other" <%= typeof filters !== 'undefined' && filters.animal_type === 'other' ? 'selected' : '' %>>🐾 Other</option>
</select>
```

---

### D. Pack Creation Page

#### File: `src/web/views/create-pack.ejs`

**Line 6 - Update page title:**
```html
<title>Create Pack - DFW Pet Rehoming</title>
```

**Line 255 - Update description:**
```html
<p class="page-description">Create a listing for one or multiple pets that need rehoming</p>
```

---

## 5. Web Routes Changes

### File: `src/web/routes.ts`

**Home page route - Extract animal_type filter:**
- Add `animal_type` to query extraction
- Pass to `PetsRepo.search()`
- Pass to view as part of filters object

---

## 6. Documentation/Branding Updates (Optional)

Consider updating these references from "Dog" to "Pet":
- Nav logo text: "DFW Dog Rehoming" → "DFW Pet Rehoming"
- Hero text on index.ejs
- Various placeholder text throughout

---

## Summary of Files to Modify

| File | Type | Changes |
|------|------|---------|
| `prisma/schema.prisma` | Schema | Add PetType enum, add field to Pets model |
| `src/core/petsRepo.ts` | Backend | Add type to interfaces, search filters, create/update |
| `src/api/pets.ts` | Backend | Add animal_type to all endpoints |
| `prisma/seed.ts` | Seed | Add animal_type to pet creation |
| `src/web/views/partials/pet-edit-modal.ejs` | Form | Add animal type dropdown |
| `src/web/views/partials/pet-edit-tile.ejs` | Form | Add animal type dropdown |
| `src/web/views/dashboard.ejs` | Form | Add animal type to inline form |
| `src/web/views/partials/pet-tile.ejs` | Display | Dynamic emoji, type tag |
| `src/web/views/partials/pet-details-tile.ejs` | Display | Dynamic emoji, type tag |
| `src/web/views/partials/pet-details-modal.ejs` | Display | Dynamic emoji, type info row |
| `src/web/views/receipt.ejs` | Display | Dynamic emoji, type tag |
| `src/web/views/index.ejs` | Filter | Add animal type filter dropdown |
| `src/web/views/create-pack.ejs` | Text | Update branding text |
| `src/web/routes.ts` | Route | Handle animal_type filter |

---

## Migration Command

After all code changes:
```bash
npx prisma migrate dev --name add_pet_type
```

---

## Testing Checklist

- [ ] Create new pet with each animal type (dog/cat/other)
- [ ] Edit existing pet's animal type
- [ ] Verify correct emoji displays on tiles
- [ ] Verify type tag displays in pet details
- [ ] Test animal type filter on home page
- [ ] Verify receipts show correct animal type
- [ ] Re-run seed script with new field
