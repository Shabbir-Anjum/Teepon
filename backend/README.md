# Move to parent directory
```bash
cd backend
```

# Set db connection settings in .env
```bash
cp .env.example .env
```
```bash
vi .env
```

* Set tidb creds in .env
* Obtain OPENAI_API_KEY and replace it

### Install poetry
```bash
pip insall poetry
```

### Install modules
```bash
poetry install --no-interaction --no-ansi
```

### Activate the poetry env
```bash
poetry shell
```

### Run the application
```bash
gunicorn --bind 127.0.0.1:5001 wsgi:app
```
