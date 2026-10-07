### Seed development classes

Set `MONGO_URI` in `.env.local` to your development database.

```powershell
npm run dev
npm run seed:classes
```

This script copies the examples in `src/data/classes.json` into MongoDB with today's local date. Rerunning updates the same examples, including their dates and available spots, without creating duplicates. The JSON stays unchanged. Page loads never
run the seed command.
