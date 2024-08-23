MIGRATIONS_DIR="migrations/versions"

# Count the number of existing migration files
MIGRATION_COUNT=$(ls -1q $MIGRATIONS_DIR/*.py | wc -l)

# Increment the count by 1 for the new migration
NEW_MIGRATION_NUMBER=$((MIGRATION_COUNT + 1))

# Generate the migration with the custom message
flask db migrate -m "$NEW_MIGRATION_NUMBER"

# Apply the migration
flask db upgrade