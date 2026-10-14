# Fitness Maxxing integration review

The branch combines merged login/account/class APIs with the classes loading shell, About Us navigation, finished gym content, location filtering, protected class creation through the API, and saved contact messages.

## Configuration

- Preserve `MONGO_URI` and Supabase configuration.
- Set server-only `GYM_ADMIN_USER_IDS` to the approved administrator UUID in the deployment environment. Do not put it in a `NEXT_PUBLIC_` variable.
- Public checkout remains simulated; no payment-provider setup is required.

## Acceptance checks

- Desktop and mobile: Home, About Us, Classes, Memberships, Contact, and Account.
- Classes: loading shell, date selection, location/category filters, retry after a database outage, and reservation availability refresh.
- Account: instant signup, invalid login, valid login, refresh persistence, safe return paths, logout, and signed-out protection.
- Reservations: book a future class, refresh, cancel, and confirm the available seat returns.
- Checkout: select a plan, refresh the account, verify saved membership/history, and confirm retry does not duplicate an order.
- Protected API: create a class and read it back after refresh. A signed-out user receives 401 and an ordinary member receives 403 from POST /api/classes. Staff can create, edit, and remove classes from the Classes page; these controls remain hidden from signed-out visitors and ordinary members.
- Contact: signed-in submission returns a saved receipt and the message persists in MongoDB.
- Content: no pending-review text, fake outbound social/contact links, or unfinished membership perks. Coach bios and addresses follow the finished site copy.

## Delivery

Review changes against `dev`, then release reviewed work to `main`. Record the deployed commit and observed user-flow results separately. The previous local UI work is recoverable in the stash named `Preserve local UI work before integrating merged dev`.
