-- Run this ONCE to create the admin account.
-- Replace the password hash below with the output of:
--   node -e "const b=require('bcryptjs');b.hash('YourAdminPassword',12).then(console.log)"
--
-- Default credentials (change immediately after first login):
--   Email:    johnedward3101@gmail.com
--   Password: Admin@Brewde1

INSERT INTO users (email, password_hash, role, status, tenant_id, force_password_change)
VALUES (
  'johnedward3101@gmail.com',
  '$2b$12$JLvmwuV2aG.9PbFA8EnrC.u7xZ3fpEuF/GETFeL1I/J7Mii5G4RGy',
  'admin',
  'active',
  NULL,
  false
)
ON CONFLICT (email) DO NOTHING;
