# Database Migrations on Render

## Deploying Schema Changes to Production

When you make changes to the Prisma schema (adding/modifying tables, columns, etc.), you need to apply those migrations to the production database on Render.

### Step-by-Step Process

1. **Develop Locally**: Create and test your migrations locally
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Commit Migrations**: Commit the new migration files in `prisma/migrations/` to git

3. **Deploy to Render**: Push your changes to trigger a new deployment

4. **Apply Migrations on Render**: 
   - Open the Render Dashboard
   - Navigate to your Web Service
   - Go to the **Shell** tab
   - Run the following command:
   ```bash
   npx prisma migrate deploy
   ```

5. **Seed the Database** (First deployment only or when adding new seed data):
   ```bash
   npx prisma db seed
   ```
   
   This will:
   - Create the default DFW location
   - Create sample users and listers for testing
   - Populate initial data required for the app to function

### Important Notes

- **`migrate deploy`** only applies existing migrations - it does NOT create new ones
- This command is safe for production environments
- Always test migrations locally before deploying
- Migration files are located in `prisma/migrations/`
- **`prisma db seed`** should only be run on first deployment or when you need to reset/add seed data
- The seed script creates the default location which is required for user registration

### Current Migrations

Recent migrations that may need to be deployed:
- `20251130205856_add_lister_profile` - Adds `display_name` and `about` fields to Listers table
- `20251130211833_add_pack_photos` - Adds `cloudinary_public_ids` array to Packs table

### Troubleshooting

If migrations fail:
- Check the Render logs for specific error messages
- Verify your `DATABASE_URL` environment variable is set correctly
- Ensure no manual schema changes were made directly to the database
- Consider using `npx prisma migrate resolve` for failed migrations

### Future Improvements

- Automate migration deployment in the build process
- Add migration status checks to CI/CD pipeline
- Implement database backup before migrations
