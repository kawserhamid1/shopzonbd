import urllib.parse

env_path = r'C:\Users\sg\shopzone3\backend\.env'
password = 'Sagor@625147'
encoded_pw = urllib.parse.quote_plus(password)
mongo_uri = f'mongodb+srv://kawserhamid625147_db_user:{encoded_pw}@shopzone.8k2c5q2.mongodb.net/shopzone?retryWrites=true&w=majority&appName=shopzone'

lines = [
    'PORT=3001',
    'JWT_SECRET=shopzone_kawsar_secret_2025',
    'JWT_EXPIRES_IN=7d',
    'ADMIN_EMAIL=kawser@shopzone.com',
    'ADMIN_PASSWORD=Admin@ShopZone2025',
    'NODE_ENV=production',
    'STRIPE_SECRET_KEY=sk_tes...here',
    'STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here',
    'STRIPE_WEBHOOK_SECRET=whsec_...here',
    f'MONGO_URI={mongo_uri}',
]

with open(env_path, 'w', newline='\n') as f:
    f.write('\n'.join(lines) + '\n')

# Verify
with open(env_path, 'r') as f:
    for line in f:
        if line.startswith('MONGO_URI'):
            print('MONGO_URI length:', len(line.strip()))
            print('Has encoded pw:', 'Sagor%40625147' in line)
            print('Has shopzone cluster:', 'shopzone.8k2c5q2' in line)
