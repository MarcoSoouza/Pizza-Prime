# TODO - Reserva Page & Database Integration

## Plan
1. **schema.sql** — Add `status`, `aniversario`, `promocao` columns to `reservas` table
2. **database.py** — Update `criar_reserva()` and related functions to support new columns
3. **api.py** — Update `post_reserva()` endpoint to extract and pass new fields
4. **reserva.html** — Reorganize form steps, fix validation, send all fields to API
5. **reserva.css** — Fix positioning bugs, improve design, move inline styles

## Progress
- [x] Step 1: Update schema.sql
- [x] Step 2: Update database.py
- [x] Step 3: Update api.py
- [x] Step 4: Update reserva.html
- [x] Step 5: Update reserva.css
- [x] Step 6: Test full reservation flow
- [x] Step 7: Push to GitHub
