### Seed development classes

Set `MONGO_URI` in `.env.local` to your development database.

```powershell
$env:NODE_ENV = "development"
npm run seed:classes
```

The entry point is `scripts/seed-classes.ts`. Running `npm run dev` in another
terminal does not set `NODE_ENV` for this command. If `NODE_ENV` != "development", seeding
cannot occur.

This script copies the examples in `src/data/classes.json` into MongoDB with today's local date. Rerunning updates the same examples, including their dates and available spots, without creating duplicates. The JSON stays unchanged. Page loads never
run the seed command.

If any object in classes.json fails validation, the entire seed is rejected.

## Check the classes database

Run the standalone connection and data check with:

```powershell
npx tsx scripts/check-classes.ts
```

This script loads environment settings, connects to MongoDB, reports connection
and class information, and disconnects. It does not insert classes.

## Run automated tests

Runs all vitests

```powershell
npm test
```

To display each test’s name and result.

```powershell
npm test -- --reporter=verbose
```
