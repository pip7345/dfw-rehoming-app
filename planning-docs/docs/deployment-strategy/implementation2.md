Things to fix in the second iteration:
- The entire website needs a dark mode theme.
- Create Pack modal needs to be bigger. Lister should be able to add dogs 
- If the user is not authenticated, I want the message to be shown in the browser window and not in an alert popup. Don't use popups in this site.
- The user should be able to create a pack without experiencing authentication issues if they are already logged in.

Third iteration fixes:
- The Lister should arrive on the Lister Dashboard after logging in or registering, not the visitor landing page.
- On the home page, in the desktop view, the search button is too long. Put it next to the size filter. 
- On the contact settings, I want the Lister to be able to also add Facebook Messenger as a contact preference. Can I do this without a facebook API? If not, set this for later.
- The background on the dashboard is white. It doesn't follow the dark mode theme.
- The new pack button brings up a modal and the modal doesn't have any of the controls specified in implementation.md. 
- I think the pets table in the database should have a receipt foreign key.
- The Dashboard shows up twice on the same page stacked on top of each other. It should only show up once.
- The Pack and the pets will not be added to the database until checkout is complete.
- Set up Paypal in a demo mode where purchases are not actually charged. Give a visual indicator that this is a demo mode.
- Implement Cloudinary Integration on implementation-status.md
- Update implementation-status.md to reflect the current status of the project.