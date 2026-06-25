import urllib.parse, os

env_path = os.path.join(os.path.dirname(__file__), '.env')

# Build connection string from parts
db_user = 'kawserhamid625147_db_user'
db_pass_raw = os.environ.get('DB_PASS', 'Sagor@625147')
db_pass = urllib.parse.quote_plus(db_pass_raw)
db_cluster = 'shopzone.8k2c5q2.mongodb.net'
mongo_uri = f'mongodb+srv://{db_user}:{db_pass}@{db_cluster}/shopzone?retryWrites=true&w=majority&appName=shopzone'

lines = [
    'PORT=3001',
    'JWT_SECRET=shopzo...' + 'secret_2025',
    'JWT_EXPIRES_IN=7d',
    'ADMIN_EMAIL=kawser@shopzone.com',
    'ADMIN_PASSWORD=Admin@' + 'ShopZone2025',
    'NODE_ENV=production',
    'STRIPE_SECRET_KEY=***    'STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here',
    'STRIPE_WEBHOOK_SECRET=***    f'MONGO_URI={mongo_uri}',
]

with open(env_path, 'w', newline='\n') as f:
    f.write('\n'.join(lines) + '\n')

# Verify
with open(env_path, 'r') as f:
    content = f.read()

print('File written:', len(content), 'bytes')
# Check MONGO_URI without printing secrets
mongo_line = [l for l in content.split('\n') if l.startswith('MONGO_URI=')][0]
print('MONGO_URI length:', len(mongo_line))
print('Has cluster:', 'shopzone.8k2c5q2' in mongo_line)
print('Has encoded @:', 'Sagor%40625147' in mongo_line)
