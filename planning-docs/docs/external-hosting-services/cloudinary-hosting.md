# Cloudinary Image Hosting

## Overview
Cloudinary is a cloud-based image and video management service. Free tier includes 25GB storage and 25GB monthly bandwidth with automatic image optimization and transformations.

## Current Implementation

### Client-Side Upload with Upload Widget

We use Cloudinary's Upload Widget for client-side uploads with the following configuration:

**Image Specifications:**
- **Dimensions**: All images automatically cropped to 800x600 pixels (4:3 aspect ratio)
- **Max file size**: 5MB per image
- **Max images per pet**: 10
- **Allowed formats**: JPG, JPEG, PNG, WebP
- **Folder**: All pet images stored in `pets/` folder
- **Tags**: `pet`, `listing` automatically applied

**Upload Widget Configuration:**
```javascript
{
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  cropping: true,
  croppingAspectRatio: 4/3, // Forces 800:600 ratio
  croppingDefaultSelectionRatio: 1,
  croppingShowDimensions: true,
  showSkipCropButton: false, // Requires cropping
  maxFileSize: 5242880, // 5MB limit
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  eager: [
    { width: 800, height: 600, crop: 'fill' } // Auto-resize on upload
  ],
  folder: 'pets',
  tags: ['pet', 'listing']
}
```

### Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=dwk2tmiqo
CLOUDINARY_UPLOAD_PRESET=unsigned_preset
CLOUDINARY_API_KEY=743619742929469
CLOUDINARY_API_SECRET=<your_api_secret>
```

### Setup Unsigned Upload Preset

1. Log into [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Go to **Settings → Upload → Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `unsigned_preset`
   - **Signing Mode**: Unsigned
   - **Folder**: `pets`
   - **Use filename**: No (use random names)
   - **Unique filename**: Yes
   - **Allowed formats**: jpg, jpeg, png, webp
   - **Max file size**: 5MB (5242880 bytes)
5. Under **Eager transformations**, add:
   - Transformation: `c_fill,w_800,h_600`
6. Save preset

### Security Considerations

**Current Approach (Client-Side Upload):**
- ⚠️ **Security Risk**: Upload preset name and cloud name are visible in browser source code
- ⚠️ Anyone who inspects your page source can upload to your Cloudinary account
- ⚠️ No server-side validation or rate limiting before upload
- ⚠️ Potential for quota abuse

**Mitigation Steps:**
1. Set **quota alerts** in Cloudinary dashboard (Settings → Account → Notifications)
2. Enable **rate limiting** in upload preset settings
3. Monitor **usage regularly** via dashboard
4. Consider implementing **server-side upload** for production (see below)
5. Set **resource limits** in preset (max dimensions, max file size)

### Data Storage

**Database Storage:**
- Only the `public_id` is stored (e.g., `"pets/abc123xyz"`)
- Full URLs are constructed at display time
- No sensitive data exposed in database

**Image Display URLs:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/c_fill,w_800,h_600/{public_id}.jpg
```

**Thumbnail URLs:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/c_fill,w_320,h_240/{public_id}.jpg
```

### Image Transformations

Cloudinary automatically applies transformations via URL:
- `c_fill` - Crop to fill dimensions
- `w_800,h_600` - Resize to 800x600
- `q_auto` - Automatic quality optimization
- `f_auto` - Automatic format selection (WebP, AVIF)

Example URL with all optimizations:
```
https://res.cloudinary.com/{cloud_name}/image/upload/c_fill,w_800,h_600,q_auto,f_auto/{public_id}
```

### Future: Server-Side Upload (Recommended for Production)

For production, implement server-side upload to improve security:

**Architecture:**
1. User selects images in browser (no upload yet)
2. Browser sends images to `/api/images/upload` endpoint
3. Server validates:
   - User is authenticated
   - File size and format are valid
   - User hasn't exceeded rate limits
4. Server uploads to Cloudinary using API secret (secure)
5. Server returns public_ids to browser
6. Browser saves pet with public_ids

**Benefits:**
- Cloudinary credentials stay on server (not exposed)
- Rate limiting per user
- Better security and control
- Validation before upload
- Can add virus scanning, content moderation

**Implementation Example:**
```javascript
// Server-side upload endpoint
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.post('/api/images/upload', authenticate, async (req, res) => {
  const file = req.files.image;
  
  // Validate
  if (file.size > 5242880) {
    return res.status(400).json({ error: 'File too large' });
  }
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'pets',
    transformation: [{ width: 800, height: 600, crop: 'fill' }],
    tags: ['pet', 'listing']
  });
  
  res.json({ public_id: result.public_id });
});
```

## Pros
- Free tier sufficient for initial scale
- Automatic image optimization reduces bandwidth
- On-the-fly transformations (no need to store multiple sizes)
- CDN included for fast delivery
- Easy Node.js integration
- Handles format conversion automatically
- Built-in cropping in Upload Widget

## Cons
- Free tier bandwidth limit (25GB/month) may be restrictive if traffic grows
- Unsigned upload preset exposes cloud name to public
- Vendor lock-in with proprietary transformation URLs
- Pricing increases significantly beyond free tier

## Recommendation
Use client-side Upload Widget with unsigned preset for MVP phase. Monitor usage and implement server-side upload before production launch.

## References

- [Cloudinary Upload Widget Documentation](https://cloudinary.com/documentation/upload_widget)
- [Node.js Integration](https://cloudinary.com/documentation/node_integration)
- [Image Transformations Reference](https://cloudinary.com/documentation/image_transformations)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [Cropping Images](https://cloudinary.com/documentation/resizing_and_cropping)

## Next Actions
1. ✅ Store API credentials in environment variables (never commit to repo)
2. ✅ Configure Upload Widget with cropping (800x600)
3. ✅ Set up unsigned upload preset with restrictions
4. ✅ Implement folder structure (`pets/`) for organizing images
5. ⏳ Monitor usage and set quota alerts
6. ⏳ Test upload limits and transformation performance
7. ⏳ Implement server-side upload before production
