# Development memberships

Complimentary memberships are stored in `team7.memberships`, linked by verified Supabase `userId`, with plan, unique member ID, status, and validity period. `manual_demo` grants do not process payment or automatically renew.

`GET /api/membership` verifies the current user and reads only their record. It returns 401 when signed out, 503 for provider/database failures, and uncached responses. Expired memberships display as expired even if the stored status has not been updated.

Manual grants use a trusted database connection. `/api/checkout` explicitly saves simulated selections and can create `demo_checkout` memberships; it never charges money and does not replace an active manual grant. The account page shows the saved demo order history and current membership after refresh.

Profiles, preferences, and reservations also persist in MongoDB. See [Account data](account-data.md) for their ownership, validation, transaction, and verification contracts. Real paid checkout must be designed separately around verified payment-provider results.
