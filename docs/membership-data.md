# Development memberships

Complimentary demo memberships are stored in the `team7.memberships` MongoDB collection and linked by Supabase `userId`. Records include the plan, unique member ID, status, validity period, and `manual_demo` source. These grants do not process payment or automatically renew.

`GET /api/membership` verifies the Supabase user on the server, then queries only that identity. It returns 401 when signed out, 503 for provider/database failure, and a private, uncached response for a successful read. Expired records display as expired even if their stored status has not been updated.

There is no public endpoint for granting memberships. Manual development grants are performed through a trusted local database connection. Future paid checkout must use server-confirmed payment and a separate design; the existing checkout remains simulated and does not persist its state to MongoDB.

The account page loads saved memberships after sign-in and refresh. Names and contact fields remain Supabase auth metadata until the separate MongoDB profile work is implemented. Reservations remain temporary.
